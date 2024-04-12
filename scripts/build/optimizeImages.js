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
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "avif",
  "tiff",
  "svg",
];
const supportedOutputFormats = [
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "avif",
  "tiff",
];

// 画像ファイルのパスパターンを作成
const srcGlob = path.join(srcDir, "/**/*").replace(/\\/g, "/");

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

      // サポートされていない入力フォーマットの場合または、
      // サポートされていない出力フォーマットかつ、Webpへの変換が無効化の場合は、
      // 圧縮できないのでそのままコピーする
      if (
        !supportedInputFormats.includes(fileExt) ||
        (!supportedOutputFormats.includes(fileExt) && !convertToWebp)
      ) {
        Logger.log(
          "WARN",
          `Unsupported input format: ${fileExt} (${srcPath}). Copying the file as is.`
        );
        await fs.cp(srcPath, distPath);

        // コピーしたことを示すINFOログを出力
        Logger.log("INFO", `Copied: ${srcPath} -> ${distPath}`);

        // 次のファイルの処理に進む
        continue;
      } else {
        let processedDistPath;
        // サポートされている入力フォーマットの場合は変換処理を実行
        if (convertToWebp) {
          // WebP形式に変換する
          processedDistPath = path.join(
            path.dirname(distPath),
            path.basename(distPath, path.extname(distPath)) + ".webp"
          );
          await sharp(srcPath)
            .resize({ width: 800, withoutEnlargement: true })
            .toFormat("webp", { quality: webpQuality })
            .toFile(processedDistPath);
        } else {
          // 対応している出力フォーマットで出力する
          processedDistPath = distPath;
          await sharp(srcPath)
            .resize({ width: 800, withoutEnlargement: true })
            .toFormat(fileExt, { quality: 80 })
            .toFile(processedDistPath);
        }

        // 圧縮前のファイルサイズを取得
        const srcSize = (await fs.stat(srcPath)).size;
        // 圧縮後のファイルサイズを取得
        const distSize = (await fs.stat(processedDistPath)).size;
        // 圧縮前と後のファイルサイズを表示
        Logger.log(
          "INFO",
          `Optimized: ${srcPath} (${(srcSize / 1024).toFixed(
            2
          )}KB) -> ${processedDistPath} (${(distSize / 1024).toFixed(2)}KB)`
        );
      }
    }
    Logger.log("INFO", "Image files processed successfully.");
  }
} catch (err) {
  Logger.log("ERROR", err);
}
