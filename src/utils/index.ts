import chalk from "chalk";
import { reg } from "./constants";
import * as types from "@babel/types";
import { ICliOptions, IConfig } from "@/types";
import { pathExists, resolve } from "./file";
import { pathToFileURL } from "node:url";

export const isChinese = (text: string, options: IConfig) => {
  const { local } = options;
  if (["zh-CN", "zh-TW"].includes(local)) {
    return reg.cnReg.test(text);
  } else {
    return reg.allWordsReg.test(text);
  }
};

/**
 * 判断是否为可执行的表达式
 * @param code
 * @returns
 */
export const isExpression = (code: string) => {
  try {
    new Function(code)();
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 判断是否为对象字符串
 * @param str
 * @returns
 */
export const isObjStr = (str: string) => {
  const objectRegex = /^\s*\{[\s\S]*\}\s*$/;
  return objectRegex.test(str);
};

export function getRealI18nMethod(
  method: string
): types.Identifier | types.MemberExpression | undefined;
export function getRealI18nMethod(
  method: string,
  getString: boolean
): string | undefined;

/**
 * 用户兼容用户传入的国际化方法 $t或者i18n.$t， 最多只能两级
 * @param method 用户传入的i18n方法，$t或者i18n.$t
 * @param getString 可选 返回ast对象还是string
 * @returns
 */
export function getRealI18nMethod(method: string, getString?: boolean) {
  if (!method) {
    console.log(chalk.red("国际化函数不能为空！"));
    throw new Error("A function cannot be empty");
  }
  const methods = method.split(".");
  if (getString) return methods[0];
  if (methods.length === 1) {
    return types.identifier(methods[0]);
  } else if (methods.length === 2) {
    return types.memberExpression(
      types.identifier(methods[0]),
      types.identifier(methods[1])
    );
  } else if (methods.length > 2) {
    console.log(chalk.red("国际化函数最多只能为两级调用！"));
    throw new Error("A function call can contain at most two levels");
  }
}

/**
 * 延时
 * @param interval 时间间隔
 * @returns
 */
export const sleep = (interval: number) =>
  new Promise((resolve) => setTimeout(resolve, interval));

/**
 * 用于合并默认和读取到的用户配置
 * @param options
 */
export const mergeOptions = async (options?: ICliOptions) => {
  const { default: defaultOptions } = await import("@/defaultConfig");
  const configFile = options?.config || "i18n.config.js";
  const configPath = resolve(configFile);
  const fileExists = await pathExists(configPath);
  if (!fileExists) {
    console.log(chalk.red(`请检查 ${configPath} 配置文件是否正确\n`));
    process.exit(1);
  }
  const importUrl = pathToFileURL(configPath).href;
  const { default: userOptions } = await import(importUrl);
  return { ...defaultOptions, ...userOptions } as IConfig;
};
