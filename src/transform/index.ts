import { readFile } from "node:fs/promises";
import { IConfig } from "@/types";
import { getFilesPath } from "@/utils/file";
import path from "node:path";
import transformTsx from "./transformTsx";
import transformVue from "./transformVue";
import chalk from "chalk";
import ProgressBar from "progress";

export const transform = async (
  localData: Map<string, string>,
  needTranslateCode: Map<string, string>,
  options: IConfig
) => {
  const { entry, exclude } = options;
  if (!Array.isArray(entry) || entry.some((item) => typeof item !== "string")) {
    console.log(chalk.red("entry必须是字符串数组！"));
  }
  const paths = await getFilesPath(entry, exclude);
  const bar = new ProgressBar("文件转换中 [:bar] :percent", {
    complete: "=",
    incomplete: " ",
    total: paths.length,
  });
  for (const p of paths) {
    console.info(p)
    const ext = path.extname(p);
    const code = await readFile(p, { encoding: "utf8" });
    switch (ext) {
      case ".jsx":
      case ".tsx":
        await transformTsx(code, p, {
          options,
          isVueTemplate: false,
          isTsx: true,
          localeData: localData,
          needTranslateCode,
          isWrite: true,
          shouldImport: true,
        });
        break;
      case ".html":
        break;
      case ".vue":
        transformVue(code, p, {
          options,
          needTranslateCode,
          isVueTemplate: true,
          isTsx: false,
          localeData: localData,
          isWrite: true,
        });
        break;
      default:
    }
    bar.tick();
  }
};
