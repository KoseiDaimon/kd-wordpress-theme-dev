import path from "path";
import fs from "fs/promises";
import { removeDir } from "./removeDir";

// ディレクトリの同期処理（srcDirにdestDirを合わせる）を行う関数
export async function syncDir(srcDir, destDir, event, file) {
  const srcFile = file;
  const destFile = path.resolve(destDir, path.relative(srcDir, file));
  const destFileDir = path.dirname(destFile);

  switch (event) {
    case "add":
    case "change":
      await fs.mkdir(destFileDir, { recursive: true }).catch((err) => {
        if (err.code !== "EEXIST") {
          throw err;
        }
      });
      await fs.copyFile(srcFile, destFile);
      console.log(
        `Copied ${path.relative(process.cwd(), file)} to ${path.relative(process.cwd(), destFile)}`
      );
      break;
    case "unlink":
      await fs.unlink(destFile).catch((err) => {
        if (err.code !== "ENOENT") {
          throw err;
        }
      });
      console.log(`Removed ${path.relative(process.cwd(), destFile)}`);
      break;
    case "unlinkDir":
      await removeDir(destFile);
      console.log(`Removed directory ${path.relative(process.cwd(), destFile)}`);
      break;
    default:
      break;
  }
}
