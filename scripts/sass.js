import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";

const scssGlob = "./src/scss/**/*.scss";
const distDir = "./assets/css";

const srcPaths = await glob(scssGlob);
console.log(srcPaths);

await fs.mkdir(distDir, { recursive: true });

for (const srcPath of srcPaths) {
  if (path.basename(srcPath).startsWith("_")) {
    continue;
  }

  const distFileName = path.basename(srcPath, ".scss") + ".css";
  const distPath = path.join(distDir, distFileName);
  console.log(distPath);

  try {
    const result = await sass.compileAsync(srcPath);
    await fs.writeFile(distPath, result.css);
    console.log(`${srcPath} has been compiled to ${distPath}`);
  } catch (err) {
    console.error(`Failed to compile ${srcPath}: ${err}`);
  }
}
