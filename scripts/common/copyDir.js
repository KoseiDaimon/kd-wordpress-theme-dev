import path from "path";
import fs from "fs/promises";

// ディレクトリ全体をコピーする関数
export async function copyDir(srcDir, destDir) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true }).catch((err) => {
        if (err.code !== "EEXIST") {
          throw err;
        }
      });
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
      console.log(
        `Copied ${path.relative(process.cwd(), srcPath)} to ${path.relative(
          process.cwd(),
          destPath
        )}`
      );
    }
  }
}
