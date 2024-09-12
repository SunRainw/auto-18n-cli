import { IConfig } from "@/types";
import { defaultTreeAdapter } from "parse5";
import type { DefaultTreeAdapterMap } from "parse5";
import { isChinese, isObjStr, isExpression } from "@/utils";
import transformTsx from "./transformTsx";
import { ITraverseOptions } from "@/types/transform";
import mustache from "mustache";
import { serialize } from "parse5";
import {
  VUE_TEMPLATE_PREFIX,
  VUE_TEMPLATE_SUFFIX,
  reg,
} from "@/utils/constants";
import { getGeneratorKey } from "@/utils/getLocales";
import * as parse5 from "parse5";

type ChildNode = DefaultTreeAdapterMap["childNode"];
type Node = DefaultTreeAdapterMap["node"];
type TextNode = DefaultTreeAdapterMap["textNode"];
type Element = DefaultTreeAdapterMap["element"];
type CommentNode = DefaultTreeAdapterMap["commentNode"];

function isTextNode(node: Node): node is TextNode {
  return node.nodeName === "#text";
}
function isElement(node: Node): node is Element {
  return node.nodeName !== "#text";
}
function isComment(node: Node): node is CommentNode {
  return node.nodeName === "#comment";
}

class TransformVueTemplate {
  #options: IConfig;
  #sourceCode: string = "";
  #localeData: Map<string, string> = new Map();
  #needTranslateCode: Map<string, string> = new Map();
  #cacheKey: Map<string, string> = new Map();
  #ignoreLines: number[] = [];
  constructor(sourceCode: string, options: ITraverseOptions) {
    this.#options = options.options;
    this.#sourceCode = sourceCode;
    this.#needTranslateCode = options.needTranslateCode;
    this.#toLowercase();
    this.#dealTemplateTag();
    this.#dealSelfClose();
  }
  traverseVueTemplate() {
    return this.#traverseHtml().then(() => {
      this.#dealEscapeHtml();
      this.#resetToUppercase();
      return true;
    });
  }
  #cacheTranslates(key: string, value: string) {
    if (!this.#localeData.get(key)) {
      this.#needTranslateCode.set(key, value);
    }
  }
  #getAst() {
    const ast = parse5.parse(this.#sourceCode, {
      sourceCodeLocationInfo: true,
      treeAdapter: { ...defaultTreeAdapter },
    });
    return ast;
  }
  /**
   * 将标签和属性替换为小写，因为parse5会默认将大写转换为小写
   */
  #toLowercase() {
    // 替换标签
    this.#sourceCode = this.#sourceCode.replace(
      reg.htmlTagUppercaseReg,
      (_, $s1: string, $s2: string) => {
        const temp = `${VUE_TEMPLATE_PREFIX}${$s2.toLowerCase()}${VUE_TEMPLATE_SUFFIX}`;
        this.#cacheKey.set(temp, $s2);
        return `${$s1}${temp}`;
      }
    );
    // 替换属性
    this.#sourceCode = this.#sourceCode.replace(
      reg.htmlAttrUppercaseReg,
      (str: string) => {
        const temp = `${VUE_TEMPLATE_PREFIX}${str.toLowerCase()}${VUE_TEMPLATE_SUFFIX}`;
        this.#cacheKey.set(temp, str);
        return `${temp}`;
      }
    );
    // 替换插槽
    this.#sourceCode = this.#sourceCode.replace(
      reg.slotUppercaseReg,
      (str: string) => {
        const temp = `${VUE_TEMPLATE_PREFIX}${str.toLowerCase()}${VUE_TEMPLATE_SUFFIX}`;
        this.#cacheKey.set(temp, str);
        return `${temp}`;
      }
    );
  }
  /**
   * 自闭合标签转换，由于parse5不会识别自闭合，需要将其变成双标签
   */
  #dealSelfClose() {
    this.#sourceCode = this.#sourceCode.replace(
      reg.selfCloseTagReg,
      (str, $s1: string) => {
        // str = <input type="text" />
        // $s1 = input
        const prefix = str.replace("/>", ">");
        return `${prefix}</${$s1}>`;
      }
    );
  }
  /**
   * template标签替换并换成，因为template标签在parse5中，包裹的元素不会被处理
   */
  #dealTemplateTag() {
    this.#sourceCode = this.#sourceCode.replace(
      reg.htmlTemplateTagReg,
      (_, $s1: string, $s2: string) => {
        const temp = `${VUE_TEMPLATE_PREFIX}${$s2.toLocaleLowerCase()}${VUE_TEMPLATE_SUFFIX}`;
        this.#cacheKey.set(temp, $s2);
        return `${$s1}${temp}`;
      }
    );
  }
  /**
   * 处理局部js
   * @param sourceCode 布局js的code
   * @returns code string
   */
  async #transformJs(sourceCode: string) {
    let { code } = (await transformTsx(sourceCode, "", {
      options: this.#options,
      localeData: this.#localeData,
      needTranslateCode: this.#needTranslateCode,
      isVueTemplate: true,
      isTsx: false,
      isWrite: false,
    }))!;
    code = code.replace(/\n$/, "");
    // 在template里面不能是分号结尾
    if (code.endsWith(";")) {
      code = code.slice(0, -1);
    }
    return code;
  }
  #getMethod() {
    const { vueTempPrefix, i18nMethod } = this.#options;
    const i18nArr = i18nMethod.split(".");
    const method = i18nArr.length > 1 ? i18nArr[1] : i18nArr[0];
    return vueTempPrefix ? `${vueTempPrefix}${method}` : method;
  }
  /**
   * 核心，处理html
   */
  async #traverseHtml() {
    const ast = this.#getAst();
    const html = ast.childNodes.find((nd) => nd.nodeName === "html");
    if (html && isElement(html)) {
      const body = html.childNodes.find((nd) => nd.nodeName === "body");
      if (body && isElement(body)) {
        await this.#traverse(body);
        this.#sourceCode = serialize(body);
      }
    }
  }
  async #traverse(node: ChildNode) {
    if (isElement(node) && node.childNodes) {
      for (const childNode of node.childNodes) {
        await this.#traverse(childNode);
      }
    }
    // 处理指令、绑定、事件
    if (isElement(node) && node.attrs?.length > 0) {
      const startLine = node.sourceCodeLocation?.startLine ?? 0;
      // 遇到注释就跳过
      if (this.#ignoreLines.includes(startLine)) return;
      for (const attr of node.attrs) {
        const { name, value } = attr;
        if (!isChinese(value, this.#options) || !value) return;
        if (this.#options.ignoreAttrs?.includes(name)) {
          attr.value = value;
        }
        // 处理指令，绑定
        else if (
          name.startsWith("v-") ||
          name.startsWith(":") ||
          name.startsWith("@")
        ) {
          const isExp = isExpression(value);
          const isObjString = isObjStr(value);
          if (isObjString) {
            // 处理属性中的对象
            // 对象如果直接处理会报错，需要先转换为表达式，再解析，再还原
            const tempPrefix = "i18nObjectVariablePrefix";
            let s = `${tempPrefix}=${value}`;
            s = await this.#transformJs(s);
            s = s.replace(`${tempPrefix} = `, "");
            if (value !== s) {
              attr.value = s;
            }
          } else if (isExp) {
            // 处理属性中的方法
            const code = await this.#transformJs(value);
            if (value !== code) {
              attr.value = code;
            }
          }
        } else {
          const key = getGeneratorKey(value, this.#options);
          const method = this.#getMethod();
          attr.value = `${method}('${key}')`;
          attr.name = `:${name}`;
          this.#cacheTranslates(key, value);
        }
      }
    }
    // 处理innerText
    if (isTextNode(node)) {
      const startLine = node.sourceCodeLocation?.startLine ?? 0;
      // 遇到注释就跳过
      if (this.#ignoreLines.includes(startLine)) return;
      const value = node.value.replace(reg.spaceReg, "");
      if (!isChinese(value, this.#options) || !value) return;
      let tokens = mustache.parse(value) || [];
      let text = "";
      // tokens:   ['text', '中文', 0, 2]
      for (const token of tokens) {
        const tokenType = token[0];
        const tokenText = token[1];
        if (!isChinese(tokenText, this.#options)) {
          if (tokenType === "text") {
            text += tokenText;
          } else if (tokenType === "name") {
            text += `{{${tokenText}}}`;
          }
        } else {
          if (tokenType === "text") {
            const t = tokenText.trim();
            const key = getGeneratorKey(t, this.#options);
            this.#cacheTranslates(key, t);
            const method = this.#getMethod();
            text += `{{${method}('${key}')}}`;
          } else if (tokenType === "name") {
            const temp = await this.#transformJs(tokenText);
            text += `{{${temp}}}`;
          }
        }
      }
      if (node.value !== text) {
        node.value = text;
      }
    }
    if (isComment(node) && this.#options.ignoreAnnotation) {
      if (node.data.includes(this.#options.ignoreAnnotation)) {
        const endLine = node.sourceCodeLocation?.endLine ?? 0;
        this.#ignoreLines.push(endLine + 1);
      }
    }
  }
  /**
   * 处理转义符，parse5会将部分符号转换为转义符
   */
  #dealEscapeHtml() {
    const specialStrMap = {
      "&nbsp;": " ",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&amp;": "&",
    } as const;
    const keys = Object.keys(specialStrMap) as Array<
      keyof typeof specialStrMap
    >;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = specialStrMap[key];
      const regex = new RegExp(key, "g");
      this.#sourceCode = this.#sourceCode.replace(regex, value);
    }
  }
  /**
   * 将原先换成小写的标签还原
   */
  #resetToUppercase() {
    this.#cacheKey.forEach((value, key) => {
      const regex = new RegExp(`${key}`, "g");
      this.#sourceCode = this.#sourceCode.replace(regex, (str) => {
        const temp = value || str;
        return `${temp}`;
      });
    });
  }
  getTransformCode() {
    return this.#sourceCode;
  }
}

export default TransformVueTemplate;
