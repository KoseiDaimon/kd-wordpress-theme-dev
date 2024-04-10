// common/DirectorySync.js
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import chokidar from "chokidar";

export class DirectorySync {
  constructor(srcDir, destDir) {
    this.srcDir = srcDir;
    this.destDir = destDir;
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
      const watcher = chokidar.watch(this.srcDir, {
        ignored: [/(^|\/)\.$/, /node_modules/],
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
