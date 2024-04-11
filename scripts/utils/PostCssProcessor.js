import postcss from "postcss";
import autoprefixer from "autoprefixer";
import postcssSortMediaQueries from "postcss-sort-media-queries";
import cssDeclarationSorter from "css-declaration-sorter";
import postcssDiscardDuplicates from "postcss-discard-duplicates";
import postcssNormalizeCharset from "postcss-normalize-charset";
import cssnano from "cssnano";
import fs from "fs/promises";
import path from "path";
import Logger from "../utils/Logger.js";

export default class PostCssProcessor {
  constructor(srcDir, distDir = null) {
    this.srcDir = srcDir;
    // distDirが指定されていない場合は、srcDirと同じディレクトリに設定
    this.distDir = distDir || srcDir;
    // PostCSSプラグインを設定
    this.postcssPlugins = [
      autoprefixer,
      postcssSortMediaQueries,
      cssDeclarationSorter({ order: "smacss" }),
      postcssDiscardDuplicates,
      postcssNormalizeCharset,
    ];
  }

  async optimizeCssFiles() {
    try {
      // distDirが存在しない場合は作成
      await fs.mkdir(this.distDir, { recursive: true });
      const files = await fs.readdir(this.srcDir);
      for (const file of files) {
        const srcPath = path.join(this.srcDir, file);
        // CSS以外のファイルはスキップ
        if (!file.endsWith(".css")) continue;
        const css = await fs.readFile(srcPath, "utf-8");
        const distPath = path.join(this.distDir, file);
        // PostCSSプラグインを適用
        const processedCss = await postcss(this.postcssPlugins).process(css, {
          from: srcPath,
          to: distPath,
        });
        // 処理後のCSSを書き込み
        await fs.writeFile(distPath, processedCss.css);
        Logger.log("INFO", `Optimized: ${srcPath} -> ${distPath}`);
      }

      Logger.log("INFO", "CSS optimization completed successfully.");
    } catch (err) {
      Logger.log("ERROR", `Failed to process CSS: ${err}`);
      throw err;
    }
  }

  async minifyCssFiles() {
    try {
      await fs.mkdir(this.distDir, { recursive: true });
      const files = await fs.readdir(this.srcDir);

      for (const file of files) {
        const srcPath = path.join(this.srcDir, file);
        if (!file.endsWith(".css")) continue;

        const css = await fs.readFile(srcPath, "utf-8");
        const distPath = path.join(this.distDir, file);

        const processedCss = await postcss([cssnano]).process(css, {
          from: srcPath,
          to: distPath,
        });

        await fs.writeFile(distPath, processedCss.css);

        const srcStats = await fs.stat(srcPath);
        const distStats = await fs.stat(distPath);
        const srcSize = (srcStats.size / 1024).toFixed(2);
        const distSize = (distStats.size / 1024).toFixed(2);

        Logger.log("INFO", `Minified: ${srcPath}(${srcSize}KB) -> ${distPath}(${distSize}KB)`);
      }

      Logger.log("INFO", "CSS minification completed successfully.");
    } catch (err) {
      Logger.log("ERROR", `Failed to minify CSS: ${err}`);
      throw err;
    }
  }
}
