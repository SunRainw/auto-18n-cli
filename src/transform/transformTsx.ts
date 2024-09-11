import parser from "@babel/parser";
import { Traverse } from "./traverse";
import _generator from "@babel/generator";
import { writeFile } from "node:fs/promises";
import { ITraverseOptions } from "@/types/transform";
import formatCode from "./formatCode";

// @ts-ignore
const generator: typeof _generator = _generator.default;

export default async function (
  sourceCode: string,
  filePath: string,
  options: ITraverseOptions
) {
  const ast = parser.parse(sourceCode, {
    sourceType: "module",
    plugins: [
      "jsx",
      [
        "decorators",
        {
          decoratorsBeforeExport: true,
        },
      ],
      "typescript",
    ],
  });
  const traverseAst = new Traverse(ast, options);
  const newAst = traverseAst.getAst();
  const { code }: { code: string } = generator(newAst, {
    jsescOption: {
      minimal: true,
      quotes: options.isVueTemplate ? "single" : "double",
    },
    retainLines: true,
  });
  const result = await formatCode(code, options.options);
  if (options.isWrite) {
    writeFile(filePath, result, "utf8");
  } else {
    return { code: result };
  }
}
