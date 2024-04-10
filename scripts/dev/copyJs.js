// scripts/dev/copyJs.js
import { copyDirectory } from "../common/copyDirectory.js";
import { DirectorySync } from "../common/DirectorySync.js";
import chalk from "chalk";

const srcDir = "./src/js";
const distDir = "./assets/js";

try {
  await copyDirectory(srcDir, distDir, "js");
  console.log(chalk.green("JavaScript files copied successfully."));
  const dirSync = new DirectorySync(srcDir, distDir);
  dirSync.watchFiles();
} catch (err) {
  console.error(`${chalk.red("Error:")} ${err}`);
  process.exit(1);
}
