import { langMap } from "@/utils/langMap";

export type langType = keyof (typeof langMap)["baidu"];

export type translateType = keyof typeof langMap;

export interface IBaiduResult {
  error_code?: string;
  error_msg?: string;
  trans_result?: {
    src: string;
    dst: string;
  }[];
}

export interface IYoudaoResult {
  errorCode?: string;
  translation?: string[];
}

export interface IGoogleResult {
  sentences: { trans: string }[];
}
