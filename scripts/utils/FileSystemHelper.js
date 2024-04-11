// utils/FileSystemHelper.js
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";
import chokidar from "chokidar";

export default class FileSystemHelper {
  constructor(srcDir, destDir) {
    this.srcDir = srcDir;
    this.destDir = destDir;
  }

  async copyFile(srcPath, distPath) {
    try {
      // ファイルの内容を読み込む
      const srcCode = await fs.readFile(srcPath);

      // 出力先ディレクトリが存在しない場合は作成
      await fs.mkdir(path.dirname(distPath), { recursive: true });

      // ファイルを出力先ディレクトリに書き込む
      await fs.writeFile(distPath, srcCode);
      console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
    } catch (err) {
      throw new Error(`Failed to copy ${srcPath}: ${err}`);
    }
  }

  async copyDirectory(srcDir, distDir) {
    try {
      // ソースディレクトリ内のすべてのファイルとディレクトリのパスを取得
      const srcGlob = path.join(srcDir, "**", "*").replace(/\\/g, "/");
      const srcPaths = await glob(srcGlob, { nodir: true });

      // ソースディレクトリ内にファイルがない場合は警告を表示して処理を終了
      if (srcPaths.length === 0) {
        console.warn(chalk.yellow(`Warning: No files found in ${srcDir}`));
        return;
      }

      // 出力先ディレクトリが存在しない場合は作成
      await fs.mkdir(distDir, { recursive: true });

      // 各ファイルをコピー
      for (const srcPath of srcPaths) {
        const distPath = path.join(distDir, path.relative(srcDir, srcPath));
        await this.copyFile(srcPath, distPath);
      }
    } catch (err) {
      console.error(`${chalk.red("Error:")} ${err}`);
      process.exit(1);
    }
  }

  async initialSync() {
    try {
      // ディストリビューションディレクトリを削除
      await fs.rm(this.destDir, { recursive: true, force: true });
      console.log(chalk.blue("Deleted distribution directory."));

      // ソースディレクトリの内容をコピー
      await this.copyDirectory(this.srcDir, this.destDir);
      console.log(chalk.green("Initial sync completed successfully."));
    } catch (err) {
      console.error(`${chalk.red("Error:")} Failed to perform initial sync: ${err}`);
      process.exit(1);
    }
  }

  async syncDir(event, eventPath) {
    let srcFile, destFile;
    switch (event) {
      case "add":
      case "change":
        srcFile = eventPath;
        destFile = path.resolve(this.destDir, path.relative(this.srcDir, srcFile));
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
        destFile = path.resolve(this.destDir, path.relative(this.srcDir, eventPath));
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

  watchFiles() {
    try {
      this.initialSync();

      const watcher = chokidar.watch(this.srcDir, {
        ignored: [/(^|\/)\\./, /node_modules/],
        persistent: true,
        ignoreInitial: true,
      });

      watcher.on("change", (path) => {
        console.log(`${chalk.blue("Change detected:")} ${path}`);
        this.syncDir("change", path);
      });

      watcher.on("add", (path) => {
        console.log(`${chalk.blue("File added:")} ${path}`);
        this.syncDir("add", path);
      });

      watcher.on("unlink", (path) => {
        console.log(`${chalk.blue("File removed:")} ${path}`);
        this.syncDir("unlink", path);
      });

      console.log(chalk.blue("Watching files for changes..."));
    } catch (err) {
      console.error(`${chalk.red("Error:")} Failed to start file watcher: ${err}`);
      process.exit(1);
    }
  }
}
