import { langType } from "@/types/translate";
import { IConfig } from "@/types";
import { pathExists, resolve } from "@/utils/file";
import { readFile, writeFile } from "node:fs/promises";
import chalk from "chalk";

/**
 * 
 * @param lang 要存储的语言
 * @param needTranslate 要翻译的数据
 * @param options 配置
 */
export default async function (
  lang: langType,
  needTranslate: Map<string, string>,
  options: IConfig
) {
  const { localPath } = options;
  const fileName = `${lang}.json`;
  const configPath = resolve(localPath, fileName);
  const isExist = await pathExists(configPath);
  if (!isExist) {
    writeFile(configPath, JSON.stringify({})).catch((err) => {
      if (err) {
        console.log(chalk.red(err));
        process.exit(2);
      }
    });
  }
  let data = {};
  try {
    const content = await readFile(configPath, "utf8");
    data = JSON.parse(content);
  } catch (err) {
    console.log(chalk.red(`请检查 ${configPath} 资源文件 JSON 格式是否正确`));
    process.exit(2);
  }
  data = {
    ...data,
    ...Object.fromEntries(needTranslate.entries()),
  };
  writeFile(configPath, JSON.stringify(data, null, 2)).catch((err) => {
    if (err) {
      console.log(chalk.red(err));
      process.exit(2);
    }
  });
}
