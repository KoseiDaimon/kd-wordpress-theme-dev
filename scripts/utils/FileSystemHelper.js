// utils/FileSystemHelper.js
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import chokidar from "chokidar";

export default class FileSystemHelper {
  constructor(srcPath, distPath) {
    this.srcPath = srcPath;
    this.distPath = distPath;
  }

  async copyFile(srcFile, distFile) {
    try {
      await fs.cp(srcFile, distFile);
      console.log(`${chalk.green("Success:")} Copied file ${srcFile} to ${distFile}`);
    } catch (err) {
      console.error(`${chalk.red("Error:")} Failed to copy file: ${err}`);
      throw err;
    }
  }

  async copyDir(srcDir, distDir) {
    try {
      await fs.cp(srcDir, distDir, { recursive: true });
      console.log(
        `${chalk.green("Success:")} Copied directory ${srcDir} to ${chalk.magenta(distDir)}`
      );
    } catch (err) {
      console.error(`${chalk.red("Error:")} Failed to copy directory: ${err}`);
      throw err;
    }
  }

  async initialSync() {
    try {
      // ディストリビューションディレクトリを削除
      await fs.rm(this.distPath, { recursive: true, force: true });
      console.log(chalk.blue("Deleted distribution directory."));

      // ソースディレクトリの内容をコピー
      await this.copyDir(this.srcPath, this.distPath);
      console.log(chalk.green("Initial sync completed successfully."));
    } catch (err) {
      console.error(`${chalk.red("Error:")} Failed to perform initial sync: ${err}`);
      process.exit(1);
    }
  }

  async syncDir(event, eventPath) {
    let srcFile, distFile;
    switch (event) {
      case "add":
      case "change":
        srcFile = eventPath;
        distFile = path.resolve(this.distPath, path.relative(this.srcPath, srcFile));
        await fs.mkdir(path.dirname(distFile), { recursive: true }).catch((err) => {
          if (err.code !== "EEXIST") {
            throw err;
          }
        });
        await fs.cp(srcFile, distFile);
        console.log(
          `${chalk.green("Success:")} Copied ${path.relative(
            process.cwd(),
            srcFile
          )} -> ${path.relative(process.cwd(), distFile)}`
        );
        break;
      case "unlink":
        distFile = path.resolve(this.distPath, path.relative(this.srcPath, eventPath));
        await fs.unlink(distFile).catch((err) => {
          if (err.code !== "ENOENT") {
            throw err;
          }
        });
        console.log(`${chalk.green("Success:")} Removed ${path.relative(process.cwd(), distFile)}`);
        break;
      default:
        break;
    }
  }

  watchFiles() {
    try {
      this.initialSync();

      const watcher = chokidar.watch(this.srcPath, {
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
