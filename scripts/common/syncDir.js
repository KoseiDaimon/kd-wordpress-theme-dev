import path from "path";
import fs from "fs/promises";
import chalk from "chalk";

// ディレクトリの同期処理（srcDirにdestDirを合わせる）を行う関数
export async function syncDir(srcDir, destDir, event, eventPath) {
  let srcFile, destFile;
  switch (event) {
    case "add":
    case "change":
      srcFile = eventPath;
      destFile = path.resolve(destDir, path.relative(srcDir, srcFile));
      await fs.mkdir(path.dirname(destFile), { recursive: true }).catch((err) => {
        if (err.code !== "EEXIST") {
          throw err;
        }
      });
      await fs.copyFile(srcFile, destFile);
      console.log(
        `${chalk.green("Success:")} Copied ${path.relative(
          process.cwd(),
          srcFile
        )} -> ${path.relative(process.cwd(), destFile)}`
      );
      break;
    case "unlink":
      destFile = path.resolve(destDir, path.relative(srcDir, eventPath));
      await fs.unlink(destFile).catch((err) => {
        if (err.code !== "ENOENT") {
          throw err;
        }
      });
      console.log(`${chalk.green("Success:")} Removed ${path.relative(process.cwd(), destFile)}`);
      break;
    default:
      break;
  }
}
