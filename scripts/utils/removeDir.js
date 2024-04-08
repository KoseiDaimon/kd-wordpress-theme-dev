import path from "path";
import fs from "fs/promises";

// ディレクトリを削除する関数
export async function removeDir(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.lstat(filePath);
      if (stats.isDirectory()) {
        await removeDir(filePath);
      } else {
        await fs.unlink(filePath);
      }
    }
    await fs.rm(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}
