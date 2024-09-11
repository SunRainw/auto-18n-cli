import { IConfig } from "@/types";
import { resolve } from "@/utils/file";
import * as prettier from "prettier";

export default async function (code: string, options: IConfig) {
  const { prettierPath } = options;
  if (prettierPath) {
    const path = resolve(prettierPath);
    const prettierOptions: prettier.Options = {
      parser: "babel-ts",
      ...(await prettier.resolveConfig(path)),
    };
    try {
      return prettier.format(code, prettierOptions);
    } catch (err) {
      console.error("prettier 配置读取错误！");
      return code;
    }
  } else {
    return code;
  }
}
