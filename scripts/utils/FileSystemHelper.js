import path from "path";
import fs from "fs/promises";
import chokidar from "chokidar";
import Logger from "../utils/Logger.js";

export default class FileSystemHelper {
  constructor(srcPath, distPath) {
    this.srcPath = srcPath;
    this.distPath = distPath;
  }

  async copyFile(srcFile, distFile) {
    try {
      await fs.cp(srcFile, distFile);
      Logger.log("INFO", `Copied file ${srcFile} to ${distFile}`);
    } catch (err) {
      Logger.log("ERROR", `Failed to copy file: ${err}`);
      throw err;
    }
  }

  async copyDir(srcDir, distDir) {
    try {
      await fs.cp(srcDir, distDir, { recursive: true });
      Logger.log("INFO", `Copied directory: ${srcDir} to ${distDir}`);
    } catch (err) {
      Logger.log("ERROR", `Failed to copy directory: ${err}`);
      throw err;
    }
  }

  async initialSync() {
    try {
      // ディストリビューションディレクトリを削除
      await fs.rm(this.distPath, { recursive: true, force: true });
      Logger.log("INFO", `Deleted Directory: ${this.distPath}`);

      // ソースディレクトリの内容をコピー
      await this.copyDir(this.srcPath, this.distPath);
      Logger.log("INFO", "Initial sync completed successfully.");
    } catch (err) {
      Logger.log("ERROR", `Failed to perform initial sync: ${err}`);
      throw err;
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
        Logger.log(
          "INFO",
          `Copied ${path.relative(process.cwd(), srcFile)} -> ${path.relative(
            process.cwd(),
            distFile
          )}`
        );
        break;
      case "unlink":
        distFile = path.resolve(this.distPath, path.relative(this.srcPath, eventPath));
        await fs.unlink(distFile).catch((err) => {
          if (err.code !== "ENOENT") {
            throw err;
          }
        });
        Logger.log("INFO", `Removed ${path.relative(process.cwd(), distFile)}`);
        break;
      default:
        break;
    }
  }

  async watchFiles() {
    try {
      await this.initialSync();
      const watcher = chokidar.watch(this.srcPath, {
        ignored: [/(^|\/)\\./, /node_modules/],
        persistent: true,
        ignoreInitial: true,
      });
      watcher.on("change", (path) => {
        Logger.log("DEBUG", `Change detected: ${path}`);
        this.syncDir("change", path);
      });
      watcher.on("add", (path) => {
        Logger.log("DEBUG", `File added: ${path}`);
        this.syncDir("add", path);
      });
      watcher.on("unlink", (path) => {
        Logger.log("DEBUG", `File removed: ${path}`);
        this.syncDir("unlink", path);
      });
      Logger.log("INFO", `Watching files in ${this.srcPath} for changes...`);
    } catch (err) {
      Logger.log("ERROR", `Failed to start file watcher: ${err}`);
      throw err;
    }
  }
}
