// scripts/generateIndexFiles.js
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";

const isScssPartial = (fileName) => {
  return fileName.endsWith(".scss") && fileName.startsWith("_") && fileName !== "_index.scss";
};

const createIndexContent = (scssFiles) => {
  return [
    "// This file is generated automatically by scripts/generateIndexFiles.js",
    ...scssFiles.map((file) => `@forward "./${file.slice(0, -5)}";`),
  ].join("\n");
};

export const generateIndexFiles = async (dir) => {
  try {
    const files = await fs.readdir(dir);
    const scssFiles = files.filter(isScssPartial);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await generateIndexFiles(filePath);
      }
    }

    if (scssFiles.length === 0) {
      return;
    }

    const indexFilePath = path.join(dir, "_index.scss");
    const indexContent = createIndexContent(scssFiles);

    try {
      await fs.access(indexFilePath);
      console.log(`${chalk.blue("Info:")} Overwriting existing ${indexFilePath}`);
    } catch {
      console.log(`${chalk.green("Success:")} Generating new ${indexFilePath}`);
    }

    await fs.writeFile(indexFilePath, indexContent);
  } catch (error) {
    console.error(`${chalk.red("Error:")} Error generating index file in ${dir}`);
    console.error(error);
  }
};
