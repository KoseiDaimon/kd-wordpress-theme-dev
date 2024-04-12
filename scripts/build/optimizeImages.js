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

async function processImageFile(srcPath, distPath) {
  const fileExt = path.extname(srcPath).slice(1).toLowerCase();

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
    Logger.log("INFO", `Copied: ${srcPath} -> ${distPath}`);
    return;
  }

  let processedDistPath;
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
    processedDistPath = distPath;
    await sharp(srcPath)
      .resize({ width: 800, withoutEnlargement: true })
      .toFormat(fileExt, { quality: 80 })
      .toFile(processedDistPath);
  }

  const srcSize = (await fs.stat(srcPath)).size;
  const distSize = (await fs.stat(processedDistPath)).size;
  Logger.log(
    "INFO",
    `Optimized: ${srcPath} (${(srcSize / 1024).toFixed(
      2
    )}KB) -> ${processedDistPath} (${(distSize / 1024).toFixed(2)}KB)`
  );
}

async function main() {
  try {
    const srcGlob = path.join(srcDir, "/**/*").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob, { nodir: true });

    if (srcPaths.length === 0) {
      Logger.log("WARN", `No image files found in ${srcDir}`);
      return;
    }

    await fs.mkdir(distDir, { recursive: true });

    for (const srcPath of srcPaths) {
      const relPath = path.relative(srcDir, srcPath);
      const distPath = path.join(distDir, relPath);

      await fs.mkdir(path.dirname(distPath), { recursive: true });

      await processImageFile(srcPath, distPath);
    }

    Logger.log("INFO", "Image files processed successfully.");
  } catch (err) {
    Logger.log("ERROR", err);
  }
}

main();
