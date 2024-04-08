import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";

const currentDir = process.cwd();
console.log(`Current directory: ${currentDir}`);

// const scssFilePath = path.join(currentDir, "src", "scss", "common", "common.scss");
// const cssOutputDir = path.join(currentDir, "assets", "css");
// const cssOutputPath = path.join(cssOutputDir, "common.css");

// try {
//   const result = await sass.compileAsync(scssFilePath);
//   await fs.mkdir(cssOutputDir, { recursive: true });
//   await fs.writeFile(cssOutputPath, result.css);
//   console.log(`${scssFilePath} has been compiled to ${cssOutputPath}`);
// } catch (err) {
//   console.error(`Failed to compile ${scssFilePath}: ${err}`);
// }

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

// glob(scssGlob, {}, async (err, scssFilePaths) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   console.log(scssFilePaths);

//   for (const scssFilePath of scssFilePaths) {
//     const cssFilePath = `${cssOutputDir}/${path.basename(scssFilePath, '.scss')}.css`;

//     console.log(scssFilePath);
//     try {
//       const result = await sass.compileAsync(scssFilePath);
//       await fs.writeFile(cssFilePath, result.css);
//       console.log(`${scssFilePath} has been compiled to ${cssFilePath}`);
//     } catch (err) {
//       console.error(`Failed to compile ${scssFilePath}: ${err}`);
//     }
//   }
// });
