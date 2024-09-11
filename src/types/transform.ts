import { IConfig } from "./index";

export interface ITraverseOptions {
  options: IConfig;
  localeData: Map<string, string>;
  needTranslateCode: Map<string, string>;
  isTsx: boolean;
  isVueTemplate: boolean;
  isWrite?: boolean;
  shouldImport?: boolean;
}

export enum IMPORT_TYPE {
  DefaultImport = 0, // 默认导入
  NamedImport = 1, // 命名导入
  NamespaceImport = 2, // 全部导入
}

export enum LOCALE_VAR_TYPE {
  Var = 0, // t
  Obj = 1, // {t}
}

export type I18nImportType =
  | {
      identifier: string; // 导入标识符
      modulePath: string; // 模块路径
      importType: IMPORT_TYPE; // 导入类型
    }
  | string;
