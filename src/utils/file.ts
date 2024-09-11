import chalk from "chalk";
import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";
/**
 * 判断当前路径文件是否存在
 * @param filePath 文件路径
 * @returns 
 */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    console.log(chalk.red(`${filePath}路径不存在！`));
    return false;
  }
}

export const resolve = (...paths: string[]) => {
  const root = process.cwd();
  return path.resolve(root, ...paths);
};

/**
 * 获取entry中文件夹的所有路径，排除exclude
 * @param entry 
 * @param exclude 
 * @returns 
 */
export const getFilesPath = async (
  entry: string[],
  exclude: string[]
): Promise<string[]> => {
  const paths: string[] = [];
  const excludePaths = exclude.map((item) => resolve(item));
  for (const p of entry) {
    const resolvePath = resolve(p);
    if (excludePaths.includes(resolvePath)) {
      continue;
    }
    const stats = await stat(resolvePath);
    if (stats.isDirectory()) {
      const files = await readdir(resolvePath);
      paths.push(
        ...(await getFilesPath(
          files.map((file) => path.join(p, file)),
          exclude
        ))
      );
    } else if (stats.isFile()) {
      paths.push(resolvePath);
    }
  }
  return paths;
};
