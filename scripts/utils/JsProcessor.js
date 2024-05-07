// JsProcessor.js
import * as terser from "terser";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import { config } from "../../config.js";
import Logger from "../utils/Logger.js";

export default class JsProcessor {
  constructor(srcDir, distDir) {
    this.srcDir = srcDir;
    this.distDir = distDir;
    this.minifyJs = config.options.minifyJs !== false;
  }

  async processJsFiles() {
    const srcPaths = await this._getSourcePaths();
    if (srcPaths.length === 0) {
      Logger.log("WARN", `No JavaScript files found in ${this.srcDir}`);
      return;
    }

    await fs.mkdir(this.distDir, { recursive: true });
    for (const srcPath of srcPaths) {
      await this._processFile(srcPath);
    }
  }

  async _getSourcePaths() {
    const srcGlob = path.join(this.srcDir, "**", "*.js").replace(/\\/g, "/");
    return await glob(srcGlob, { nodir: true });
  }

  async _processFile(srcPath) {
    const srcCode = await fs.readFile(srcPath, "utf-8");
    const srcSize = (srcCode.length / 1024).toFixed(2);
    if (!this.minifyJs) {
      this._writeFile(srcPath, srcCode, srcSize, srcSize);
      return;
    }
    const result = await terser.minify(srcCode, {
      ecma: 2020,
      compress: { passes: 5 },
      mangle: true
    });
    if (result.error) {
      Logger.log("ERROR", `Failed to optimize ${srcPath}: ${result.error}`);
      return;
    }
    this._writeFile(srcPath, result.code, srcSize, (result.code.length / 1024).toFixed(2));
  }

  _getDistPath(srcPath) {
    const distFileName = path.basename(srcPath);
    return path.join(this.distDir, distFileName);
  }

  async _writeFile(srcPath, code, srcSize, distSize) {
    const distPath = this._getDistPath(srcPath);
    await fs.writeFile(distPath, code);
    Logger.log("INFO", `Optimized: ${srcPath}(${srcSize}KB) -> ${distPath}(${distSize}KB)`);
  }
}
