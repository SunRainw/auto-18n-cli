import { readFile, mkdir, writeFile } from "node:fs/promises";
import { IConfig } from "@/types";
import { pathExists, resolve } from "./file";
import { nanoid } from "nanoid";
import slug from "limax";
import chalk from "chalk";

export const getLocale = async (options: IConfig, lang: string) => {
  const { localPath } = options;
  const fileName = `${lang}.json`;
  const filePath = resolve(localPath, fileName);
  const localDirPath = resolve(localPath);
  const isExistsLocalDir = await pathExists(localDirPath);
  if (!isExistsLocalDir) {
    try {
      await mkdir(localDirPath);
    } catch {
      console.log(chalk.red("创建国际化locale文件失败！"));
    }
  }
  const isExistsLocale = await pathExists(filePath);
  if (isExistsLocale) {
    let langData: Record<string, string> = {};
    try {
      const content = await readFile(filePath, { encoding: "utf8" });
      langData = JSON.parse(content);
      return new Map(Object.entries(langData));
    } catch (e) {
      return new Map<string, string>();
    }
  } else {
    await writeFile(filePath, "{}").catch(error => {
      console.log(chalk.red(error));
    });
  }
  return new Map<string, string>();
};

// export const getAllLocales = async (options: IConfig) => {
//   const { langs, local } = options;
//   const localData = await getLocale(options, local);
//   const langsMap = new Map<string, string>();
//   langsMap.set(local, localData);
//   for (let i = 0; i < langs.length; i++) {
//     const langData = await getLocale(options, langs[i]);
//     langsMap.set(langs[i], langData);
//   }
//   return langsMap;
// };

/**
 * 生成随机的国际化key
 * @param label 要转换的key
 * @param options 
 * @returns 
 */
export const getGeneratorKey = (label: string, options: IConfig) => {
  let key = "";
  const { generateStrategy, prefixKey } = options;
  if (label.includes("{") && label.includes("}")) {
    // 由于随机方式和pinyin的方式会导致{}消失，暂时不做处理
    key = label;
  } else if (generateStrategy === "slug") {
    const text = label.replace(/\$/g, "");
    /// latin = slug('i ♥ latin'); // i-love-latin;;;;;
    // const cyrillic = slug('Я люблю русский'); // ya-lyublyu-russkij
    // const pinyin = slug('我爱官话'); // wo3-ai4-guan1-hua4
    // const romaji = slug('私は ひらがな が大好き'); // ha-hiragana-gaki
    // 但是生成的拼音可能导致不同的字拼音相同，慎用
    key = slug(text, { tone: false });
  } else if (generateStrategy === "random") {
    key = nanoid();
  } else {
    key = label;
  }
  return `${prefixKey ? `${prefixKey}-` : ""}${key}`;
};
