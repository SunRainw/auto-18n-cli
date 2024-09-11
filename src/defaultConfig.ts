import { LOCALE_VAR_TYPE } from "@/types/transform";

export default {
  entry: ["./test"], // 需要国际化处理的文件夹或文件
  exclude: [], // 需要排除的文件
  i18nHooksName: "useLocale",
  i18nHooksReturnType: LOCALE_VAR_TYPE.Var,
  i18nImport: 'import { $t } from "i18n";',
  local: "zh-CN", // 本地语言
  localPath: "./locale", // 语言存放路径
  langs: ["en-US"], // 需要翻译的语言
  i18nMethod: "$t", // i18n 方法
  generateStrategy: "primitive",
  ignoreAttrs: ["style", "class", "id"],
  ignoreAnnotation: "i18n-ignore",
  ignoreMethods: [],
};
