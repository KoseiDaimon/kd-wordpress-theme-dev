// scripts/createIndexFiles.js
import path from "path";
import fs from "fs/promises";

export const createIndexFiles = async (dir) => {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await createIndexFiles(filePath);

      const indexFilePath = path.join(filePath, "_index.scss");
      const exists = await fs
        .access(indexFilePath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        const scssFiles = (await fs.readdir(filePath))
          .filter((f) => path.extname(f) === ".scss" && f !== "_index.scss")
          .map((f) => `@forward "./${f.slice(0, -5)}";`)
          .join("\n");

        await fs.writeFile(indexFilePath, scssFiles);
        console.log(`Created ${indexFilePath}`);
      }
    }
  }
};
