import fetch from "node-fetch";
import langMap from "@/utils/langMap";
import { IConfig } from "@/types";
import { IYoudaoResult, langType } from "@/types/translate";
import md5 from "md5";
import chalk from "chalk";
import { buildError } from "@/utils/httpError";

const defaultOptions = {
  from: "auto",
  to: "en",
  appKey: "",
  salt: "Rain789ter",
  sign: "",
};

const getTranslateText = ({ errorCode, translation }: IYoudaoResult) => {
  if (errorCode === "0") {
    return translation?.[0] ?? "";
  } else {
    console.info(chalk.red(`有道翻译错误：${errorCode}`));
    return "";
  }
};

const youdaoTranslate = async (
  text: string,
  lang: langType,
  options: IConfig
) => {
  const hostUrl = "https://openapi.youdao.com/api";
  const { local } = options;
  const { appId, secretKey } = options?.translate ?? {};
  const youdaoOptions = {
    q: text,
    ...defaultOptions,
  };
  if (local) {
    youdaoOptions.from = langMap("youdao", local);
  }
  if (lang) {
    youdaoOptions.to = langMap("youdao", lang);
  }
  youdaoOptions.appKey = appId ?? "";
  const str = `${youdaoOptions.appKey}${youdaoOptions.q}${youdaoOptions.salt}${secretKey}`;
  youdaoOptions.sign = md5(str);
  const bodyOption = new URLSearchParams(youdaoOptions).toString();
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: bodyOption,
  };
  const res = await fetch(hostUrl, fetchOptions);
  if (!res.ok) {
    throw await buildError(res);
  }
  const data = (await res.json()) as IYoudaoResult;
  const t = getTranslateText(data);
  return t;
};

export default youdaoTranslate;
