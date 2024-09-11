import { langType, translateType } from "@/types/translate";

export const langMap = {
  baidu: {
    // 简体中文
    "zh-CN": "zh",
    // 英语
    "en-US": "en",
    // 繁体中文
    "zh-TW": "cht",
    // 西班牙
    "es-ES": "spa",
    // 俄语
    "ru-RU": "ru",
    // 韩语
    "ko-KR": "kor",
    // 法语
    "fr-FR": "fra",
    // 德语
    "de-DE": "de",
    // 日语
    "ja-JP": "jp",
  },
  google: {
    // 简体中文
    "zh-CN": "zh",
    // 英语
    "en-US": "en",
    // 繁体中文
    "zh-TW": "cht",
    // 西班牙
    "es-ES": "es",
    // 俄语
    "ru-RU": "ru",
    // 韩语
    "ko-KR": "ko",
    // 法语
    "fr-FR": "fr",
    // 德语
    "de-DE": "de",
    // 日语
    "ja-JP": "jp",
  },
  youdao: {
    // 简体中文
    "zh-CN": "zh-CHS",
    // 英语
    "en-US": "en",
    // 繁体中文
    "zh-TW": "zh-CHT",
    // 西班牙
    "es-ES": "es",
    // 俄语
    "ru-RU": "ru",
    // 韩语
    "ko-KR": "ko",
    // 法语
    "fr-FR": "fr",
    // 德语
    "de-DE": "de",
    // 日语
    "ja-JP": "ja",
  },
} as const;

/**
 * 
 * @param type 使用翻译的类型
 * @param lang 要翻译的语言
 * @returns 
 */
export default function (type: translateType, lang: langType) {
  return langMap?.[type]?.[lang] ?? "";
}
