import * as terser from "terser";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import { config } from "../../config.js";
import Logger from "../utils/Logger.js";

// ソースのディレクトリと、出力先ディレクトリを設定
const srcDir = config.src.js;
const distDir = config.dist.js;

// JavaScriptファイルを最適化する関数
const optimizeJs = async (srcDir, distDir) => {
  try {
    // ソースディレクトリ内のすべてのJavaScriptファイルのパスを取得
    const srcGlob = path.join(srcDir, "**", "*.js").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob, { nodir: true });

    // ソースディレクトリ内にJavaScriptファイルがない場合は警告を表示して処理を終了
    if (srcPaths.length === 0) {
      Logger.log("WARN", `No JavaScript files found in ${srcDir}`);
      return;
    }

    // 出力先ディレクトリが存在しない場合は作成
    await fs.mkdir(distDir, { recursive: true });

    // 各JavaScriptファイルを最適化
    for (const srcPath of srcPaths) {
      try {
        // ファイルの内容を読み込む
        const srcCode = await fs.readFile(srcPath, "utf-8");

        // 圧縮前のファイルサイズを取得
        const srcSize = (srcCode.length / 1024).toFixed(2);

        // JavaScriptコードを最適化
        const result = await terser.minify(srcCode, {
          ecma: 2020,
          compress: { passes: 5 },
          mangle: true,
        });

        // 最適化に失敗した場合はエラーメッセージを表示して次のファイルに進む
        if (result.error) {
          Logger.log("ERROR", `Failed to optimize ${srcPath}: ${result.error}`);
          continue;
        }

        // 出力先ファイル名を取得
        const distFileName = path.basename(srcPath);

        // 出力先ファイルのパスを生成
        const distPath = path.join(distDir, distFileName);

        // 最適化されたコードを出力先ディレクトリに書き込む
        await fs.writeFile(distPath, result.code);

        // 圧縮後のファイルサイズを取得
        const distSize = (result.code.length / 1024).toFixed(2);

        // 成功メッセージと圧縮前後のファイルサイズを表示
        Logger.log("INFO", `Optimized: ${srcPath}(${srcSize}KB) -> ${distPath}(${distSize}KB)`);
      } catch (err) {
        Logger.log("ERROR", `Failed to optimize ${srcPath}: ${err}`);
      }
    }
  } catch (err) {
    Logger.log("ERROR", err);
    throw err;
  }
};

try {
  await optimizeJs(srcDir, distDir);
  Logger.log("INFO", "JavaScript files optimized successfully.");
} catch (err) {
  Logger.log("ERROR", err);
  throw err;
}
