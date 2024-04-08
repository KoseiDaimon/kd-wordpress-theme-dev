// scripts/sass.js
import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";
import chokidar from "chokidar";
import { generateIndexFiles } from "./generateIndexFiles.js";

const watch = process.argv.includes("--watch");

const compileScss = async (srcDir, distDir) => {
  try {
    const srcGlob = path.join(srcDir, "**/*.scss");
    const srcPaths = await glob(srcGlob);
    await fs.mkdir(distDir, { recursive: true });
    for (const srcPath of srcPaths) {
      if (path.basename(srcPath).startsWith("_")) {
        continue;
      }
      const distFileName = path.basename(srcPath, ".scss") + ".css";
      const distPath = path.join(distDir, distFileName);
      try {
        const result = await sass.compileAsync(srcPath);
        await fs.writeFile(distPath, result.css);
        console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
      } catch (err) {
        console.error(`${chalk.red("Error:")} Failed to compile ${srcPath}: ${err}`);
      }
    }
  } catch (err) {
    console.error(`${chalk.red("Error:")} ${err}`);
    process.exit(1);
  }
};

const scssDir = "./src/scss";
const distDir = "./assets/css";

// _index.scssの生成とSCSSのコンパイル
generateIndexFiles(scssDir)
  .then(() => {
    console.log(chalk.green("[Success] Index files created successfully."));
    return compileScss(scssDir, distDir);
  })
  .then(() => {
    console.log(chalk.green("[Success] SCSS compilation completed."));
  })
  .catch((err) => {
    console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
    process.exit(1);
  });

// watchの場合は、ファイルを監視
if (watch) {
  const watcher = chokidar.watch(scssDir, {
    ignored: [/(^|[/\\])\../, /_index\.scss$/],
    persistent: true,
  });
  watcher.on("change", (path) => {
    console.log(`${chalk.blue("Change detected:")} ${path}`);
    generateIndexFiles(scssDir)
      .then(() => {
        console.log(chalk.green("[Success] Index files created successfully."));
        return compileScss(scssDir, distDir);
      })
      .then(() => {
        console.log(chalk.green("[Success] SCSS compilation completed."));
      })
      .catch((err) => {
        console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
      });
  });
  console.log(chalk.blue("Watching for changes..."));
}
