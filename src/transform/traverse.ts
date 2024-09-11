// import { traverse } from "@babel/types";
import _traverse from "@babel/traverse";
import type { Scope, NodePath, TraverseOptions } from "@babel/traverse";
import {
  IMPORT_TYPE,
  ITraverseOptions,
  LOCALE_VAR_TYPE,
} from "@/types/transform";
import type { IConfig } from "@/types";
import * as types from "@babel/types";
import { reg } from "@/utils/constants";
import _template from "@babel/template";
import { getRealI18nMethod, isChinese } from "@/utils";
import { getGeneratorKey } from "@/utils/getLocales";
import { JSXAttribute } from "@babel/types";
import parser from "@babel/parser";
// @ts-ignore
const template: typeof _template = _template.default;
// @ts-ignore
const traverse: Scope["traverse"] = _traverse.default;

export class Traverse {
  #options: IConfig;
  #localeData = new Map();
  #ast: ReturnType<typeof parser.parse>;
  #isImported: boolean = false;
  #needImported: boolean = false;
  #shouldImported: boolean = false;
  #isVueTemplate: boolean = false;
  #isTsx: boolean = false;
  #needTranslateCode: Map<string, string> = new Map();
  constructor(ast: ReturnType<typeof parser.parse>, options: ITraverseOptions) {
    this.#ast = ast;
    this.#options = options.options;
    this.#localeData = options.localeData;
    this.#isVueTemplate = options.isVueTemplate;
    this.#shouldImported = !!options.shouldImport;
    this.#needTranslateCode = options.needTranslateCode;
    this.#isTsx = options.isTsx;
    this.#convert();
    if (!this.#isVueTemplate) {
      this.#addImport();
    }
  }
  #isDeal(value: string, node: types.Node) {
    if (!isChinese(value, this.#options)) return false;
    const { comments } = this.#ast;
    const curLine = node.loc?.start?.line;
    if (!comments || !curLine) return true;

    const curComment = comments.find(
      (item) => item.loc?.end?.line === curLine - 1
    );
    const { ignoreAnnotation } = this.#options;
    if (!curComment || !ignoreAnnotation) return true;
    if (curComment.value.includes(ignoreAnnotation)) return false;
    return true;
  }
  #cacheTranslates(key: string, value: string) {
    if (!this.#localeData.get(key)) {
      this.#needTranslateCode.set(key, value);
    }
  }

  /**
   * 在函数体最上面添加useLocale
   * @param path
   */
  #addLocaleHooks(
    path: NodePath<
      | types.FunctionDeclaration
      | types.ArrowFunctionExpression
      | types.FunctionExpression
    >
  ) {
    if (!this.#options.i18nHooksName) {
      this.#needImported = true;
      return;
    }
    // 确保只插入一次 useLocale
    let useLocaleInserted = false;
    const i18nMethod = getRealI18nMethod(this.#options.i18nMethod, true);
    if (i18nMethod) {
      path.traverse({
        VariableDeclaration: (innerPath) => {
          const temp = innerPath.node.declarations.some((decl) => {
            const { i18nHooksReturnType } = this.#options;
            if (i18nHooksReturnType === LOCALE_VAR_TYPE.Var) {
              return types.isIdentifier(decl.id) && decl.id.name === i18nMethod;
            } else if (i18nHooksReturnType === LOCALE_VAR_TYPE.Obj) {
              return (
                types.isObjectPattern(decl.id) &&
                decl.id?.properties?.some(
                  (i) =>
                    types.isObjectProperty(i) &&
                    types.isIdentifier(i.key) &&
                    i.key.name === i18nMethod
                )
              );
            }
          });
          if (temp) {
            useLocaleInserted = true;
          }
        },
      });
    }

    if (!useLocaleInserted && i18nMethod) {
      this.#needImported = true;
      const variable =
        this.#options.i18nHooksReturnType === LOCALE_VAR_TYPE.Var
          ? types.identifier(i18nMethod)
          : types.objectPattern([
              types.objectProperty(
                types.identifier(i18nMethod),
                types.identifier(i18nMethod),
                false,
                true
              ),
            ]);
      const useLocaleStatement = types.variableDeclaration("const", [
        types.variableDeclarator(
          variable,
          types.callExpression(
            types.identifier(this.#options.i18nHooksName),
            []
          )
        ),
      ]);
      // 在函数体开始处插入 useLocaleStatement
      if (path.node.body.type === "BlockStatement") {
        path.node.body.body.unshift(useLocaleStatement);
      } else {
        // 对于箭头函数表达式，可能没有 BlockStatement
        const body = types.blockStatement([
          useLocaleStatement,
          types.returnStatement(path.node.body),
        ]);
        path.get("body").replaceWith(body);
      }
    }
  }
  /**
   * 判断import，给import添加国际化hooks的导入
   * @param path
   * @return boolean
   */
  #inspectIsImported(path: NodePath<types.ImportDeclaration>) {
    let i18nImport_ = this.#options.i18nImport;
    // 兼容处理判断
    if (typeof i18nImport_ === "string") {
      const match = i18nImport_.match(reg.importReg);
      const modulePath = match?.[4] ?? "";
      const identifier = (match?.[1] || match?.[2] || match?.[3]) ?? "";
      const importType = match?.[3]
        ? IMPORT_TYPE.NamedImport
        : match?.[2]
          ? IMPORT_TYPE.NamespaceImport
          : IMPORT_TYPE.DefaultImport;
      i18nImport_ = {
        modulePath,
        identifier,
        importType,
      };
    }
    if (path.node.source.value === i18nImport_!.modulePath) {
      const specifiers = path.node.specifiers;
      return specifiers.some((specifier) => {
        // 命名导入
        if (
          types.isImportSpecifier(specifier) &&
          types.isIdentifier(specifier.imported) &&
          i18nImport_!.importType === IMPORT_TYPE.NamedImport
        ) {
          return specifier.imported.name === i18nImport_!.identifier;
        } else {
          return specifier.local?.name === i18nImport_!.identifier;
        }
      });
    } else {
      return false;
    }
  }
  #getTraverseConfig = (
    callback?: (containChinese: boolean) => void
  ): TraverseOptions<types.Node> | false => {
    const { i18nMethod } = this.#options;
    const i18nIdentifier = getRealI18nMethod(i18nMethod);
    if (i18nIdentifier) {
      return {
        ObjectExpression: (innerPath) => {
          const parentPath = innerPath.findParent((p) =>
            types.isJSXAttribute(p.node)
          ) as NodePath<JSXAttribute>;
          if (
            !(
              parentPath &&
              this.#options.ignoreAttrs?.includes(
                parentPath.node.name?.name as string
              )
            )
          ) {
            const properties = innerPath.node.properties;
            properties.forEach((item) => {
              if (
                types.isObjectProperty(item) &&
                types.isStringLiteral(item.value)
              ) {
                const value = item.value.value;
                if (this.#isDeal(value, item)) {
                  const key = getGeneratorKey(value, this.#options);
                  this.#cacheTranslates(key, value);
                  const callExpression = types.callExpression(i18nIdentifier, [
                    types.stringLiteral(key),
                  ]);
                  item.value = callExpression;
                }
              }
            });
          }
        },
        StringLiteral: (innerPath) => {
          const value = innerPath.node.value;
          if (this.#isDeal(value, innerPath.node)) {
            // containChinese = true;
            const key = getGeneratorKey(value, this.#options);
            this.#cacheTranslates(key, value);
            this.#needImported = true;
            callback?.(true);
            // this.#setLocales(value);
            const callExpression = types.callExpression(i18nIdentifier, [
              types.stringLiteral(key),
            ]);
            const type = innerPath.parent.type;
            const attrParent = innerPath.findParent((parentPath) =>
              types.isJSXAttribute(parentPath.node)
            ) as NodePath<JSXAttribute>;
            // 处理需要忽略的属性
            const { ignoreAttrs } = this.#options;
            if (
              type === "JSXAttribute" &&
              !ignoreAttrs?.includes(innerPath.parent.name.name as string)
            ) {
              innerPath.replaceWith(
                types.jsxExpressionContainer(callExpression)
              );
            } else {
              const deal = !(
                attrParent &&
                ignoreAttrs?.includes(attrParent.node.name?.name as string)
              );
              if (deal && type !== "CallExpression") {
                const inner = types.expressionStatement(callExpression);
                innerPath.replaceWith(inner);
              } else if (deal && types.isCallExpression(innerPath.parent)) {
                innerPath.replaceWith(callExpression);
              }
            }
          }
        },
        JSXText: (innerPath) => {
          const value = innerPath.node.value.replace(reg.spaceReg, "");
          if (this.#isDeal(value, innerPath.node)) {
            const key = getGeneratorKey(value, this.#options);
            this.#cacheTranslates(key, value);
            // this.#setLocales(value);
            // containChinese = true;
            callback?.(true);
            const callExpression = types.callExpression(i18nIdentifier, [
              types.stringLiteral(key),
            ]);
            innerPath.replaceWith(types.jsxExpressionContainer(callExpression));
          }
        },
        TemplateLiteral: (innerPath) => {
          // 获取文字和变量
          const { quasis, expressions } = innerPath.node;
          let formatStr = "";
          let hasChinese = false;
          quasis.forEach((element, index) => {
            const rawValue = element.value.raw;
            if (this.#isDeal(rawValue, innerPath.node)) {
              hasChinese = true;
            }
            formatStr += rawValue;
            if (index < expressions.length) {
              formatStr += `{arg${index}}`;
            }
          });
          if (hasChinese) {
            // containChinese = true;
            callback?.(true);
            // this.#setLocales(formatStr);
            // * `我是${a}人，我叫${b}`，转换为t("我是{arg0}人，我叫{arg1}", {arg0: a, arg1: b})
            const key = getGeneratorKey(formatStr, this.#options);
            const args = [
              types.stringLiteral(key),
              types.objectExpression(
                expressions.map((exp, i) =>
                  types.objectProperty(
                    types.identifier(`arg${i}`),
                    exp as types.Expression
                  )
                )
              ),
            ];
            this.#cacheTranslates(key, formatStr);
            innerPath.replaceWith(types.callExpression(i18nIdentifier, args));
          }
        },
        DirectiveLiteral: (innerPath) => {
          const value = innerPath.node.value;
          if (this.#isDeal(value, innerPath.node)) {
            const key = getGeneratorKey(value, this.#options);
            this.#cacheTranslates(key, value);
            const callExpression = types.callExpression(i18nIdentifier, [
              types.stringLiteral(key),
            ]);
            const newStatement = types.expressionStatement(callExpression);
            innerPath.parentPath.insertBefore(newStatement);
            innerPath.parentPath.remove();
          }
        },
        CallExpression: (innerPath) => {
          // 排除注释
          const { comments } = this.#ast;
          const curLine = innerPath.node.loc?.start?.line ?? 0;
          const curComment = comments?.find(
            (item) => item.loc?.end?.line === curLine - 1
          );
          const { ignoreAnnotation, i18nMethod, ignoreMethods } = this.#options;
          if (
            curComment &&
            ignoreAnnotation &&
            curComment.value.includes(ignoreAnnotation)
          ) {
            innerPath.skip();
          }
          const { callee } = innerPath.node;
          let methodName = "";
          if (types.isMemberExpression(callee)) {
            methodName = `${(callee.object as types.Identifier).name}.${(callee.property as types.Identifier).name}`;
          } else if (types.isIdentifier(callee)) {
            methodName = callee.name;
          }
          // 排除已经翻译
          if (methodName === i18nMethod) innerPath.skip();
          // 排除需要忽略的函数
          if (ignoreMethods.includes(methodName)) innerPath.skip();
        },
      };
    } else {
      return false;
    }
  };
  /**
   * 遍历顶层函数，转换国际化
   * @param path
   * @returns
   */
  #dealTopFunction(
    path: NodePath<
      | types.FunctionDeclaration
      | types.ArrowFunctionExpression
      | types.FunctionExpression
    >
  ) {
    const isTop = !path.findParent(
      (p) =>
        p.isFunctionDeclaration() ||
        p.isFunctionExpression() ||
        p.isArrowFunctionExpression()
    );
    if (!isTop) return;
    let containChinese = false;
    const config = this.#getTraverseConfig(
      (isContain) => (containChinese = isContain)
    );
    if (config) {
      path.traverse(config);
      if (containChinese) {
        this.#addLocaleHooks(path);
      }
    }
  }
  #convert() {
    let traverseConfig: TraverseOptions<types.Node> = {
      ImportDeclaration: (path) => {
        if (this.#inspectIsImported(path)) {
          this.#isImported = true;
        }
      },
    };
    if (this.#isTsx) {
      traverseConfig = {
        ...traverseConfig,
        FunctionDeclaration: (path) => this.#dealTopFunction(path),
        VariableDeclaration: (path) => {
          const p = path.get("declarations");
          p.forEach((declarationPath) => {
            const initPath = declarationPath.get("init");
            if (
              types.isArrowFunctionExpression(initPath.node) ||
              types.isFunctionExpression(initPath.node)
            ) {
              this.#dealTopFunction(
                initPath as NodePath<
                  types.ArrowFunctionExpression | types.FunctionExpression
                >
              );
            }
          });
        },
      };
    }
    if (!this.#isTsx) {
      const config = this.#getTraverseConfig((isContain) => {
        this.#needImported = isContain;
      });
      traverseConfig = {
        ...traverseConfig,
        ...(config ? config : {}),
      };
    }
    traverse(this.#ast, traverseConfig);
  }
  #addImport() {
    if (this.#needImported && !this.#isImported && this.#shouldImported) {
      const { i18nImport } = this.#options;
      let importStr = "";
      if (typeof i18nImport !== "string" && i18nImport.identifier) {
        const suffix = `from ${i18nImport.modulePath}`;
        switch (i18nImport.importType) {
          case IMPORT_TYPE.DefaultImport:
            importStr = `import ${i18nImport.identifier} ${suffix}`;
            break;
          case IMPORT_TYPE.NamedImport:
            importStr = `import { ${i18nImport.identifier} } ${suffix}`;
            break;
          case IMPORT_TYPE.NamespaceImport:
            importStr = `import * as ${i18nImport.identifier} ${suffix}`;
            break;
          default:
            importStr = "";
        }
      } else if (typeof i18nImport === "string") {
        importStr = i18nImport;
      }
      const importDeclaration = template.ast(importStr);
      const importDeclarationArr = Array.isArray(importDeclaration)
        ? importDeclaration
        : [importDeclaration];
      this.#ast.program.body.unshift(...importDeclarationArr);
    }
  }
  getAst() {
    return this.#ast;
  }
}
