import { IConfig } from "@/types";
import { getLocale } from "@/utils/getLocales";
import { transform } from "@/transform/index";
// import { defaultConfig } from "@/utils/constants";
import chalk from "chalk";
import saveTranslate from "@/utils/saveTranslate";

const main = async (userOptions: Partial<IConfig>) => {
  // console.log(chalk.green("正在进行一键国际化，请稍后..."));
  // const options = Object.assign(defaultConfig, userOptions);
  // const { local } = options;
  // const localData = await getLocale(options, local);
  // const needTranslateCode = new Map<string, string>();
  // await transform(localData, needTranslateCode, options);
  // saveTranslate(local, needTranslateCode, options);
  // console.info(needTranslateCode)
};

main({
  entry: ["./tests/vue"],
  i18nMethod: "i18n.t",
});

export default main;
