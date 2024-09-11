import { pathExists, resolve } from "./utils/file";
import inquirer from "inquirer";
import prettier from "prettier";
import { writeFile } from "node:fs/promises";
import chalk from "chalk";

export default async function () {
  const configFile = "i18n.config.js";
  const defaultPath = resolve(`./${configFile}`);
  let isExist = await pathExists(defaultPath);
  if (isExist) {
    const ans = await inquirer.prompt([
      {
        name: "overwrite",
        type: "confirm",
        message: `配置文件${configFile}已存在，是否覆盖？`,
      },
    ]);
    if (!ans.overwrite) process.exit(0);
  }
  const { default: defaultOptions } = await import("@/defaultConfig");
  let content = `export default ${JSON.stringify(defaultOptions)}`;
  content = await prettier.format(content, {
    parser: "babel",
    trailingComma: "es5",
  });
  writeFile(defaultPath, content, "utf8")
    .then(() => {
      console.log(chalk.green("初始化成功~"));
    })
    .catch((err) => {
      if (err) {
        console.log(chalk.red(err));
        process.exit(2);
      }
    });
}
