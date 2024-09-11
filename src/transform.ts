import { transform } from "@/transform/index";
import { ICliOptions } from "@/types";
import { mergeOptions } from "@/utils";
import { getLocale } from "@/utils/getLocales";
import saveTranslate from "@/utils/saveTranslate";
import chalk from "chalk";

export default async function (opt?: ICliOptions) {
  console.log(chalk.green("国际化转换开始"));
  const options = await mergeOptions(opt);
  const { local } = options;
  const localData = await getLocale(options, local);
  const needTranslateCode = new Map<string, string>();
  await transform(localData, needTranslateCode, options);
  saveTranslate(local, needTranslateCode, options);
}
