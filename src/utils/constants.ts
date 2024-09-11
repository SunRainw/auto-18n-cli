import { IConfig } from "@/types";
import { LOCALE_VAR_TYPE } from "@/types/transform";

export const reg = {
  importReg:
    /import\s+(?:(\w+)|\*\s+as\s+(\w+)|\{\s*(\w+)\s*\})\s+from\s+["'](.+?)["']/,
  cnReg: /[\u4e00-\u9fa5]/,
  // 支持unicode的语言
  allWordsReg: /\p{L}+/u,
  // 包含大写字母的标签：<Test> <aTest> </aTest>
  htmlTagUppercaseReg: /(<\/?)(([a-z][a-z0-9-]+)?[A-Z][a-zA-Z0-9-]*)/g,
  // 包含大写字母的属性，<a :Abc>, <a @Abc>, <a :aBc.sync>
  htmlAttrUppercaseReg:
    /(?<=\s|^)((@?)(:?)([a-z][a-z0-9-]*)?[A-Z][a-zA-Z0-9-]*)(\.[a-zA-Z0-9-]+)?(?=[=\s>])/g,
  // 包含大写字母的插槽
  slotUppercaseReg:
    /(?<=\s|^)(#([a-z][a-z0-9-]+)?[A-Z][a-zA-Z0-9-]*)(?=[=\s>])/g,
  // 匹配自闭合标签
  selfCloseTagReg:
    /<([a-z][a-z0-9-]*)(\s+[^<>\s=]+(=("([^"]*)")|('([^']*)')|([^<>\s"'=]*))?)*\s*\/>/g,
  // template标签
  htmlTemplateTagReg: /(<\/?)(template)/g,
  // 用于去除提取的文字的头尾回车和空格
  spaceReg: /^\s+|\s+$|\n/g,
};

// export const defaultConfig: IConfig = {
//   entry: ["./test"], // 需要国际化处理的文件夹或文件
//   exclude: [], // 需要排除的文件
//   i18nHooksName: "useLocale",
//   i18nHooksReturnType: LOCALE_VAR_TYPE.Var,
//   i18nImport: 'import { useLocale } from "@/hooks/useLocale";',
//   local: "zh-CN", // 本地语言
//   localPath: "./locale", // 语言存放路径
//   langs: ["en-US"], // 需要翻译的语言
//   i18nMethod: "$t", // i18n 方法
//   generateStrategy: "random",
//   ignoreAttrs: ["style", "className", "class"],
//   ignoreAnnotation: "i18n-ignore",
// };

export const VUE_TEMPLATE_PREFIX = `i18nvuetemplateprefix`;
export const VUE_TEMPLATE_SUFFIX = `i18nvuetemplatesuffix`;
