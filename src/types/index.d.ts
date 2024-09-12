import { I18nImportType, LOCALE_VAR_TYPE } from "./transform";
import type { langType, translateType } from "./translate";

export interface IConfig {
  entry: string[]; // 需要国际化处理的文件夹或文件
  exclude: string[]; // 需要排除的文件
  i18nImport: I18nImportType;
  i18nHooksName?: string;
  i18nHooksReturnType: LOCALE_VAR_TYPE;
  local: langType; // 本地语言
  localPath: string; // 语言存放路径
  langs: langType[]; // 需要翻译的语言
  i18nMethod: string; // i18n 方法
  generateStrategy?: "slug" | "random" | "primitive"; // 国际化生成的key，如果传入pinyin则使用拼音作为key，未传入或传入其他值则使用原始值
  prefixKey?: string; // 国际化生成key的前缀
  ignoreAttrs?: string[]; // 要忽略的属性
  ignoreAnnotation?: string; // 在要忽略的行后添加，就不会进行国际化转换和提取
  ignoreMethods: string[];
  translate?: {
    type: translateType;
    appId: string; // 翻译的appId
    secretKey: string; // 翻译的secretKey
    interval: number; // 翻译的间隔 ms， 默认为1000
  };
  prettierPath?: string; // prettier的地址，用于格式化，如果没有就不会进行格式化
  vueTempPrefix: string | false
}

export interface ICliOptions {
  version: string;
  config: string;
}
