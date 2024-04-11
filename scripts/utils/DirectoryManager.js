// utils/DirectoryManager.js
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import chokidar from "chokidar";
import { glob } from "glob";

export default class DirectoryManager {
  constructor(srcDir, destDir) {
    this.srcDir = srcDir;
    this.destDir = destDir;
    this.initialSyncDirectory();
  }

  async copyFile(srcPath, distPath) {
    try {
      await fs.copyFile(srcPath, distPath);
      console.log(`${chalk.green("Success:")} Copied ${srcPath} -> ${distPath}`);
    } catch (err) {
      console.error(`${chalk.red("Error:")} Failed to copy ${srcPath}: ${err}`);
    }
  }

  async copyDirectory(srcDir, distDir) {
    try {
      const srcGlob = path.join(this.srcDir, "**", "*.*").replace(/\\/g, "/");
      const srcPaths = await glob(srcGlob, { nodir: true });
      console.log(`srcGlob: ${srcGlob}`);
      console.log(`srcPaths: ${srcPaths}`);

      if (srcPaths.length === 0) {
        console.warn(chalk.yellow(`Warning: No files found in ${srcDir}`));
        return;
      }

      await fs.mkdir(distDir, { recursive: true });

      for (const srcPath of srcPaths) {
        const stats = await fs.stat(srcPath);
        const distPath = path.join(distDir, path.relative(srcDir, srcPath));

        await this.copyFile(srcPath, distPath);
      }
    } catch (err) {
      console.error(`${chalk.red("Error:")} ${err}`);
      process.exit(1);
    }
  }

  async initialSyncDirectory() {
    try {
      await fs.rm(this.destDir, { recursive: true, force: true });
      console.log(chalk.blue("Deleted distribution directory."));

      await this.copyDirectory(this.srcDir, this.destDir);
      console.log(chalk.green("Initial sync completed successfully."));
    } catch (err) {
      console.error(`${chalk.red("Error:")} Failed to perform initial sync: ${err}`);
      process.exit(1);
    }
  }

  async syncDirectory(event, eventPath) {
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
    // this.initialSyncDirectory();

    try {
      const watcher = chokidar.watch(this.srcDir, {
        ignored: [/(^|\/)\.$/, /node_modules/],
        persistent: true,
        ignoreInitial: true,
      });

      watcher.on("change", (path) => {
        console.log(`${chalk.blue("Change detected:")} ${path}`);
        this.syncDirectory("change", path);
      });

      watcher.on("add", (path) => {
        console.log(`${chalk.blue("File added:")} ${path}`);
        this.syncDirectory("add", path);
      });

      watcher.on("unlink", (path) => {
        console.log(`${chalk.blue("File removed:")} ${path}`);
        this.syncDirectory("unlink", path);
      });

      console.log(chalk.blue("Watching files for changes..."));
    } catch (err) {
      console.error(`${chalk.red("Error:")} Failed to start file watcher: ${err}`);
      process.exit(1);
    }
  }
}
