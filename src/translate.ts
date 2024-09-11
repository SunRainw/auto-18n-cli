import { translateCore } from "@/translate/index";
import { ICliOptions } from "./types";
import { mergeOptions } from "./utils";
import chalk from "chalk";

export default async function (opt: ICliOptions) {
  console.log(chalk.green("国际化翻译开始"));
  const options = await mergeOptions(opt);
  translateCore(options);
}
