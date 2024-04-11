import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { glob } from "glob";
import { config } from "../../config.js";
import Logger from "../utils/Logger.js";

const srcDir = config.src.images;
const distDir = config.dist.images;
const convertToWebp = config.options.convertToWebp !== false;
const webpQuality = config.options.webpQuality || 80;
const supportedInputFormats = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "tiff",
  "gif",
  "svg",
  "psd",
  "ppm",
  "exr",
  "heif",
  "avif",
];
const supportedOutputFormats = ["jpg", "jpeg", "png", "webp", "tiff", "gif", "avif", "heif"];

// 画像ファイルのパスパターンを作成
const srcGlob = path
  .join(srcDir, "/**/*.{" + supportedInputFormats.join(",") + "}")
  .replace(/\\/g, "/");

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

      if (convertToWebp) {
        // WebP形式に変換する
        await sharp(srcPath)
          .resize({
            width: 800,
            withoutEnlargement: true,
          })
          .toFormat("webp", { quality: webpQuality })
          .toFile(
            path.join(
              path.dirname(distPath),
              path.basename(distPath, path.extname(distPath)) + ".webp"
            )
          );
      } else if (supportedOutputFormats.includes(fileExt)) {
        // 対応している出力フォーマットで出力する
        await sharp(srcPath)
          .resize({
            width: 800,
            withoutEnlargement: true,
          })
          .toFormat(fileExt, { quality: 80 })
          .toFile(distPath);
      } else {
        // 対応していない出力フォーマットの場合は警告を表示してコピー
        Logger.log(
          "WARN",
          `Unsupported output format: ${fileExt} (${srcPath}). Copying the file as is.`
        );
        await fs.copyFile(srcPath, distPath);
      }

      // 圧縮前のファイルサイズを取得
      const srcSize = (await fs.stat(srcPath)).size;
      // 圧縮後のファイルサイズを取得
      const distSize = (
        await fs.stat(convertToWebp ? distPath.replace(path.extname(distPath), ".webp") : distPath)
      ).size;

      // 圧縮前と後のファイルサイズを表示
      Logger.log(
        "INFO",
        `Processed: ${srcPath}(${(srcSize / 1024).toFixed(2)}KB) -> ${
          convertToWebp ? distPath.replace(path.extname(distPath), ".webp") : distPath
        }(${(distSize / 1024).toFixed(2)}KB)`
      );
    }

    Logger.log("INFO", "Image files processed successfully.");
  }
} catch (err) {
  Logger.log("ERROR", err);
}
