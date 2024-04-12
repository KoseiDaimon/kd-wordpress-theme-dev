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
const maxWidth = config.options.maxWidth || 1920;
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

async function processImageFile(srcPath, distPath) {
  const fileExt = path.extname(srcPath).slice(1).toLowerCase();

  // 入力フォーマットがサポートされていない、または出力フォーマットがサポートされておらずWebP変換が無効の場合は、
  // 圧縮せずにファイルをそのままコピーする
  if (
    !supportedInputFormats.includes(fileExt) ||
    (!supportedOutputFormats.includes(fileExt) && !convertToWebp)
  ) {
    Logger.log(
      "WARN",
      `Unsupported input format: ${fileExt} (${srcPath}). Copying the file as is.`
    );
    await fs.cp(srcPath, distPath);
    Logger.log("INFO", `Copied: ${srcPath} -> ${distPath}`);
    return;
  }

  let processedDistPath;

  if (convertToWebp) {
    // 画像をWebP形式に変換する
    processedDistPath = path.join(
      path.dirname(distPath),
      path.basename(distPath, path.extname(distPath)) + ".webp"
    );
    await sharp(srcPath)
      .resize({ width: maxWidth, height: null, withoutEnlargement: true })
      .toFormat("webp", { quality: webpQuality })
      .toFile(processedDistPath);
  } else {
    // WebPに変換せずに画像を処理する
    processedDistPath = distPath;
    await sharp(srcPath)
      .resize({ width: maxWidth, height: null, withoutEnlargement: true })
      .toFormat(fileExt, { quality: 80 })
      .toFile(processedDistPath);
  }

  // 処理前後のファイルサイズを計算する
  const srcSize = (await fs.stat(srcPath)).size;
  const distSize = (await fs.stat(processedDistPath)).size;

  // 最適化結果をログに出力する
  Logger.log(
    "INFO",
    `Optimized: ${srcPath} (${(srcSize / 1024).toFixed(
      2
    )}KB) -> ${processedDistPath} (${(distSize / 1024).toFixed(2)}KB)`
  );
}

async function main() {
  try {
    // ソース画像ファイルのグロブパターンを生成する
    const srcGlob = path.join(srcDir, "/**/*").replace(/\\/g, "/");

    // ソース画像ファイルのパスのリストを取得する
    const srcPaths = await glob(srcGlob, { nodir: true });

    // 画像ファイルが見つからない場合はチェックする
    if (srcPaths.length === 0) {
      Logger.log("WARN", `No image files found in ${srcDir}`);
      return;
    }

    // 出力ディレクトリが存在しない場合は作成する
    await fs.mkdir(distDir, { recursive: true });

    // 各ソース画像ファイルを処理する
    for (const srcPath of srcPaths) {
      const relPath = path.relative(srcDir, srcPath);
      const distPath = path.join(distDir, relPath);

      // 現在の画像ファイルの出力ディレクトリを作成する
      await fs.mkdir(path.dirname(distPath), { recursive: true });

      // 画像ファイルを処理する
      await processImageFile(srcPath, distPath);
    }

    // 成功メッセージをログに出力する
    Logger.log("INFO", "Image files processed successfully.");
  } catch (err) {
    // エラーが発生した場合はログに出力する
    Logger.log("ERROR", err);
  }
}

// メイン関数を実行する
main();
