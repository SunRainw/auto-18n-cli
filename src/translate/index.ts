import { IConfig } from "@/types";
import { langType } from "@/types/translate";
import { sleep } from "@/utils";
import { getLocale } from "@/utils/getLocales";
import translate from "./translate";
import ProgressBar from "progress";
import saveTranslateResult from "@/utils/saveTranslate";

const getNeedTranslation = async (lang: langType, options: IConfig) => {
  const { local } = options ?? {};
  let result = new Map<string, string>();
  const localMap = await getLocale(options, local);
  const langMap = await getLocale(options, lang);
  localMap.forEach((value, key) => {
    if (!langMap.get(key)) {
      result.set(key, value);
    }
  });
  return result;
};

export const translateCore = async (options: IConfig) => {
  const { type, interval = 1000 } = options.translate ?? {};
  const { langs } = options ?? {};
  // 设置最大翻译字符串长度
  const maxStringLen = 1000;
  const separator = "\n";
  for (let i = 0; i < langs.length; i++) {
    const lang = langs[i];
    // 根据local和当前语言的对比，计算出needTranslate的值
    let needTranslate = await getNeedTranslation(lang, options);
    let collectTextLength = 0;
    const collectText = [];
    const collectKey: string[] = [];
    let index = 0;
    const bar = new ProgressBar(`翻译${lang}中 [:bar] :percent`, {
      complete: "=",
      incomplete: " ",
      total: needTranslate.size,
    });
    let translateResult = new Map<string, string>();
    for (const [key, value] of needTranslate) {
      collectTextLength = collectTextLength + value.length + separator.length;
      collectText.push(value);
      collectKey.push(key);
      if (
        collectTextLength >= maxStringLen ||
        index === needTranslate.size - 1
      ) {
        const translateText = collectText.join(separator);
        await sleep(interval);
        const res = await translate(type!, translateText, lang, options);
        if (res) {
          let resArr = [];
          if (Array.isArray(res)) {
            resArr = res.map((item) => item);
          } else {
            resArr = res.split(separator);
          }
          translateResult = new Map(
            resArr.map((item, index) => [item, collectKey[index]])
          );
        }
        collectText.slice(0);
        collectKey.splice(0);
        collectTextLength = 0;
      }
      index++;
      bar.tick();
    }
    saveTranslateResult(lang, translateResult, options);
  }
};
