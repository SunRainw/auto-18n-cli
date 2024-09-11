import { readFileSync } from "node:fs";
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)).toString()
);
export default packageJson;
