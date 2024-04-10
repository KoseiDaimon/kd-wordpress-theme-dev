import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";
import { generateIndexFiles } from "../common/generateIndexFiles.js";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import postcssSortMediaQueries from "postcss-sort-media-queries";
import cssDeclarationSorter from "css-declaration-sorter";
import postcssNormalizeCharset from "postcss-normalize-charset";
import CleanCSS from "clean-css";

const srcDir = "./src/scss";
const distDir = "./assets/css";

const postcssPlugins = [
  autoprefixer,
  postcssSortMediaQueries,
  cssDeclarationSorter({ order: "smacss" }),
  postcssNormalizeCharset,
];

const cleanCSS = new CleanCSS({
  level: {
    1: {
      specialComments: 0,
    },
  },
});

const processScssFile = async (srcPath, distDir) => {
  const distFileName = path.basename(srcPath, ".scss") + ".css";
  const distPath = path.join(distDir, distFileName);

  try {
    const result = await sass.compileAsync(srcPath);
    const processedCss = await postcss(postcssPlugins).process(result.css, {
      from: srcPath,
      to: distPath,
    });
    const minifiedCss = cleanCSS.minify(processedCss.css);
    await fs.writeFile(distPath, minifiedCss.styles);
    console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
  } catch (err) {
    console.error(`${chalk.red("Error:")} Failed to compile ${srcPath}: ${err}`);
  }
};

const compileScss = async (srcDir, distDir) => {
  try {
    const srcGlob = path.join(srcDir, "**", "*.scss").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob);

    if (srcPaths.length === 0) {
      console.warn(chalk.yellow(`Warning: No SCSS files found in ${srcDir}`));
      return;
    }

    await fs.mkdir(distDir, { recursive: true });

    const promises = srcPaths
      .filter((srcPath) => !path.basename(srcPath).startsWith("_"))
      .map((srcPath) => processScssFile(srcPath, distDir));

    await Promise.all(promises);
  } catch (err) {
    console.error(`${chalk.red("Error:")} ${err}`);
    process.exit(1);
  }
};

(async () => {
  try {
    await generateIndexFiles(srcDir);
    console.log(chalk.green("[Success] Index files created successfully."));
    await compileScss(srcDir, distDir);
    console.log(chalk.green("[Success] SCSS compilation completed."));
  } catch (err) {
    console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
    process.exit(1);
  }
})();
