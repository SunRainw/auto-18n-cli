import fetch from "node-fetch";
import langMap from "@/utils/langMap";
import { IConfig } from "@/types";
import { IBaiduResult, langType } from "@/types/translate";
import md5 from "md5";
import chalk from "chalk";
import { buildError } from "@/utils/httpError";

const defaultOptions = {
  from: "auto",
  to: "en",
  appid: "",
  salt: "Rain789ter",
  sign: "",
};

const getTranslateText = ({
  error_code,
  error_msg,
  trans_result,
}: IBaiduResult) => {
  if (!error_code && trans_result) {
    return trans_result.map((item) => item.dst);
  } else {
    console.info(chalk.red(`百度翻译错误：${error_code}-${error_msg}`));
    return "";
  }
};

const baiduTranslate = async (
  text: string,
  lang: langType,
  options: IConfig
) => {
  const hostUrl = "https://fanyi-api.baidu.com/api/trans/vip/translate";
  const { local } = options;
  const { appId, secretKey } = options?.translate ?? {};
  const baiduOptions = {
    q: text,
    ...defaultOptions,
  };
  if (local) {
    baiduOptions.from = langMap("baidu", local);
  }
  if (lang) {
    baiduOptions.to = langMap("baidu", lang);
  }
  baiduOptions.appid = appId ?? "";
  const str = `${baiduOptions.appid}${baiduOptions.q}${baiduOptions.salt}${secretKey}`;
  baiduOptions.sign = md5(str);
  const bodyOption = new URLSearchParams(baiduOptions).toString();
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
  const data = (await res.json()) as IBaiduResult;
  const t = getTranslateText(data);
  return t;
};

export default baiduTranslate;
