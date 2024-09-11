import typescript from "rollup-plugin-typescript2";
// import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/cli.ts",
  plugins: [typescript()],
  output: {
    dir: "dist",
    format: "es",
  },
};
