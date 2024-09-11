#! /usr/bin/env node

import { program } from "commander";
import packageJson from "./utils/package";
import chalk from "chalk";
import init from "./init";
import transform from "./transform";
import { ICliOptions } from "./types";
import translate from "./translate";

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(chalk.green(`v${packageJson.version}`, "-v", "--version"))
  .option("-c, --config <path>", "设置配置文件地址，默认为./i18n.config.ts");

program
  .command("init")
  .alias("i")
  .description("初始化i18n配置文件")
  .action(() => {
    init();
  });

program
  .command("transform")
  .alias("tf")
  .description("转换并提取代码中的文字")
  .action((path: string, options: ICliOptions) => {
    transform(options);
  });

program
  .command("translate")
  .alias("tl")
  .description("翻译收集到的国际化文字")
  .action((path: string, options: ICliOptions) => {
    translate(options);
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(chalk.red(error.stack));
  process.exit(1);
});
