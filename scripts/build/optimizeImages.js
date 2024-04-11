import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { glob } from "glob";
import { config } from "../../config.js";
import Logger from "../utils/Logger.js";

const srcDir = config.src.images;
const distDir = config.dist.images;
const supportedFormats = ["jpg", "jpeg", "png", "webp"];

// 画像ファイルのパスパターンを作成
const srcGlob = path.join(srcDir, "/**/*.{" + supportedFormats.join(",") + "}").replace(/\\/g, "/");

try {
  // パターンにマッチする画像ファイルのパスを取得
  const srcPaths = await glob(srcGlob, { nodir: true });

  // 画像ファイルが見つからない場合は警告を表示して処理を終了
  if (srcPaths.length === 0) {
    Logger.log("WARN", `No image files found in ${srcDir}`);
  } else {
    await fs.mkdir(distDir, { recursive: true });

    // 各画像ファイルに対して処理を実行
    for (const srcPath of srcPaths) {
      const relPath = path.relative(srcDir, srcPath);
      const distPath = path.join(distDir, relPath);
      const fileExt = path.extname(srcPath).slice(1).toLowerCase();

      // 出力先ディレクトリを作成 (存在しない場合)
      await fs.mkdir(path.dirname(distPath), { recursive: true });

      // 圧縮前のファイルサイズを取得
      const srcSize = (await fs.stat(srcPath)).size;

      // 画像を最適化して出力する
      await sharp(srcPath)
        .resize({ width: 800, withoutEnlargement: true })
        .toFormat(fileExt === "jpg" || fileExt === "jpeg" ? "jpeg" : fileExt, {
          quality: 80,
        })
        .toFile(distPath);

      // 圧縮後のファイルサイズを取得
      const distSize = (await fs.stat(distPath)).size;

      // 圧縮前と後のファイルサイズを表示
      Logger.log(
        "INFO",
        `Optimized: ${srcPath}(${(srcSize / 1024).toFixed(2)}KB) -> ${distPath}(${(
          distSize / 1024
        ).toFixed(2)}KB)`
      );
    }

    Logger.log("INFO", "Images files optimized successfully.");
  }
} catch (err) {
  Logger.log("ERROR", err);
}
