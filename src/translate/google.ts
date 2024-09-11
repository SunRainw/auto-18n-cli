import fetch from "node-fetch";
import langMap from "@/utils/langMap";
import { IConfig } from "@/types";
import { IGoogleResult, langType } from "@/types/translate";
import { buildError } from "@/utils/httpError";

const defaultOptions = {
  sl: "auto",
  tl: "en",
};

const getTranslateText = ({ sentences }: IGoogleResult) => {
  return sentences
    .filter((s) => "trans" in s)
    .map((s) => s.trans)
    .join("");
};

const googleTranslate = async (
  text: string,
  lang: langType,
  options: IConfig
) => {
  const hostUrl =
    "https://translate.google.com/translate_a/single?client=at&dt=t&dt=rm&dj=1";
  const { local } = options;
  const googleOptions = {
    q: text,
    ...defaultOptions,
  };
  if (local) {
    googleOptions.sl = langMap("google", local);
  }
  if (lang) {
    googleOptions.tl = langMap("google", lang);
  }

  const bodyOption = new URLSearchParams(googleOptions).toString();
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
  const data = (await res.json()) as IGoogleResult;
  const t = getTranslateText(data);
  return t;
};

export default googleTranslate;
