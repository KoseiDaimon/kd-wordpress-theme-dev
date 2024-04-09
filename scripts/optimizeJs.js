import * as terser from "terser";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";
import chokidar from "chokidar";

const watch = process.argv.includes("--watch");
const srcDir = "./src/js";
const distDir = "./assets/js";

const optimizeJs = async (srcDir, distDir) => {
  try {
    const srcGlob = path.join(srcDir, "**", "*.js").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob);

    if (srcPaths.length === 0) {
      console.warn(chalk.yellow(`Warning: No JavaScript files found in ${srcDir}`));
      return;
    }

    await fs.mkdir(distDir, { recursive: true });

    for (const srcPath of srcPaths) {
      const srcCode = await fs.readFile(srcPath, "utf-8");
      const result = await terser.minify(srcCode, {
        ecma: 2020,
        compress: true,
        mangle: true,
      });

      if (result.error) {
        console.error(`${chalk.red("Error:")} Failed to optimize ${srcPath}: ${result.error}`);
        continue;
      }

      const distFileName = path.basename(srcPath);
      const distPath = path.join(distDir, distFileName);
      await fs.writeFile(distPath, result.code);

      console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
      console.log(
        chalk.green("File size: ") + chalk.bold(`${(result.code.length / 1024).toFixed(2)} KB`)
      );
    }
  } catch (err) {
    console.error(`${chalk.red("Error:")} ${err}`);
    process.exit(1);
  }
};

const handleChange = (changedFilePath) => {
  const changedDirPath = path.dirname(changedFilePath);
  optimizeJs(changedDirPath, distDir)
    .then(() => {})
    .catch((err) => {});
};

const watchFiles = () => {
  const watcher = chokidar.watch(srcDir, {
    ignored: [/(^|\/)\./, /node_modules/],
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", (path) => {
    console.log(`${chalk.blue("Change detected:")} ${path}`);
    handleChange(path);
  });

  watcher.on("add", (path) => {
    console.log(`${chalk.blue("File added:")} ${path}`);
    handleChange(path);
  });

  watcher.on("unlink", (path) => {
    console.log(`${chalk.blue("File removed:")} ${path}`);
    handleChange(path);
  });

  console.log(chalk.blue("Watching JavaScript for changes..."));
};

try {
  optimizeJs(srcDir, distDir);
  if (watch) {
    watchFiles();
  }
} catch (err) {
  process.exit(1);
}
