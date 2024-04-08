// scripts/generateIndexFiles.js
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";

export const generateIndexFiles = async (dir) => {
  const files = await fs.readdir(dir);
  const scssFiles = files.filter(
    (f) => f.endsWith(".scss") && f.startsWith("_") && f !== "_index.scss"
  );

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
  const indexContent = scssFiles.map((f) => `@forward "./${f.slice(0, -5)}";`).join("\n");

  try {
    await fs.access(indexFilePath);
    console.log(`${chalk.blue("Info:")} Overwriting existing ${indexFilePath}`);
  } catch {
    console.log(`${chalk.green("Success:")} Generating new ${indexFilePath}`);
  }

  await fs.writeFile(indexFilePath, indexContent);
};
