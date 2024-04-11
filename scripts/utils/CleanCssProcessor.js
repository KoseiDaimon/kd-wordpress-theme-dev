import fs from "fs/promises";
import path from "path";
import CleanCSS from "clean-css";
import Logger from "../utils/Logger.js";

export default class CleanCssProcessor {
  constructor(srcDir, distDir = null) {
    this.srcDir = srcDir;
    // distDirが指定されていない場合は、srcDirと同じディレクトリに設定
    this.distDir = distDir || srcDir;
    // CleanCSSオプションを設定
    this.cleanCSS = new CleanCSS({
      level: {
        1: {
          specialComments: 0,
        },
      },
    });
  }

  async minifyCSS(css) {
    try {
      // CSSをミニファイ
      const minifiedCss = await this.cleanCSS.minify(css);
      return minifiedCss.styles;
    } catch (err) {
      Logger.log("ERROR", `Failed to minify CSS: ${err}`);
      throw err;
    }
  }

  async createDistDir() {
    try {
      await fs.access(this.distDir);
    } catch {
      await fs.mkdir(this.distDir, { recursive: true });
    }
  }

  async minifyCssFiles() {
    try {
      // distDirが存在しない場合は作成
      await this.createDistDir();

      // srcDir内の全てのCSSファイルを処理
      const files = await fs.readdir(this.srcDir);
      for (const file of files) {
        if (path.extname(file) === ".css") {
          const srcFile = path.join(this.srcDir, file);
          const distFile = path.join(this.distDir, file);
          const css = await fs.readFile(srcFile, "utf8");
          const minifiedCss = await this.minifyCSS(css);
          await fs.writeFile(distFile, minifiedCss);
          Logger.log("INFO", `Minified ${srcFile} -> ${distFile}`);
        }
      }
    } catch (err) {
      Logger.log("ERROR", `Failed to process directory: ${err}`);
      throw err;
    }
  }
}
