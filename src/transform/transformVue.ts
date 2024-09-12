import { parse } from "@vue/compiler-sfc";
import { writeFile } from "node:fs/promises";
import TransformVueTemplate from "./transformVueTemplate";
import { ITraverseOptions } from "@/types/transform";
import transformTsx from "./transformTsx";

const getScriptCode = (
  code: string,
  attrs: { lang?: string; setup?: boolean }
) => {
  const attrsText = Object.keys(attrs)
    .map((key) => {
      if (key === "lang") {
        return `lang="${attrs[key]}"`;
      } else if (key === "setup" && attrs.setup) {
        return `setup`;
      }
    })
    .join(" ");
  return `<script ${attrsText}>
  ${code}
  </script>`;
};

const getOtherCode = (code: string) => {
  let result = code.replace(/<template[\s\S]*?>[\s\S]*?<\/template>/gi, "");
  // 移除 <script> 标签及其内容
  result = result.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

  return result.trim(); // 去除可能的前后空白
};

const transformVue = async (
  sourceCode: string,
  filePath: string,
  options: ITraverseOptions
) => {
  const parsed = parse(sourceCode);
  // 获取template
  const template = parsed.descriptor.template?.content;
  const t = new TransformVueTemplate(template!, options);
  await t.traverseVueTemplate();
  const templateCode = `<template>
  ${t.getTransformCode()}
  </template>`;
  const scriptObj = parsed.descriptor.script ?? parsed.descriptor.scriptSetup;
  let scriptCode = "";
  if (scriptObj) {
    const { attrs, content: script } = scriptObj;
    const { code } = (await transformTsx(script, "", {
      ...options,
      isWrite: false,
      isVueTemplate: false,
      isTsx: false,
      shouldImport: true,
    }))!;
    scriptCode = getScriptCode(code, attrs);
  }
  const styleCode = getOtherCode(sourceCode.replace(template!, ""));

  const newCode = `${templateCode}\n${scriptCode}\n${styleCode}`;
  if (options.isWrite) {
    writeFile(filePath, newCode, "utf8");
  } else {
    return { code: newCode };
  }
};

export default transformVue;
