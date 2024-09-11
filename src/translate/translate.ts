import { IConfig } from "@/types";
import { langType, translateType } from "@/types/translate";
import baiduTranslate from "./baidu";
import googleTranslate from "./google";
import youdaoTranslate from "./youdao";

export default function (
  type: translateType,
  text: string,
  lang: langType,
  options: IConfig
) {
  if (type === "baidu") {
    return baiduTranslate(text, lang, options);
  } else if (type === "google") {
    return googleTranslate(text, lang, options);
  } else if (type === "youdao") {
    return youdaoTranslate(text, lang, options);
  }
}
