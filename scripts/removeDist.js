import { rm } from "fs/promises";
import chalk from "chalk";

const distDir = "./assets/css";

try {
  await rm(distDir, { recursive: true });
  console.log(`${chalk.green("Success:")} Removed directory ${distDir}`);
} catch (err) {
  if (err.code === "ENOENT") {
    console.log(`${chalk.blue("Info:")} Directory ${distDir} does not exist`);
  } else {
    console.error(`${chalk.red("Error:")} Error removing directory ${distDir}`);
    console.error(err);
  }
}
