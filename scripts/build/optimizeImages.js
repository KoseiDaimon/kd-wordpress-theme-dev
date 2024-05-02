// Node.jsのモジュールをインポート
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { glob } from "glob";
import { optimize } from "svgo";
import { config } from "../../config.js";
import Logger from "../utils/Logger.js";

// 設定ファイルから画像ディレクトリと変換オプションを取得
const srcImagesDir = config.src.images;
const distImagesDir = config.dist.images;
const convertToWebp = config.options.convertToWebp !== false;
const imageQuality = config.options.imageQuality || 80;
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

// 画像ファイルの処理を行う非同期関数
async function processImageFile(srcPath, distPath) {
  const fileExt = path.extname(srcPath).slice(1).toLowerCase();

  // 入力フォーマットがサポートされていない場合は、圧縮せずにファイルをそのままコピーする
  if (!supportedInputFormats.includes(fileExt)) {
    Logger.log(
      "WARN",
      `Unsupported input format: ${fileExt} (${srcPath}). Copying the file as is.`
    );
    await fs.cp(srcPath, distPath);
    Logger.log("INFO", `Copied: ${srcPath} -> ${distPath}`);
    return;
  }

  // SVGファイルの場合は、SVGOで最適化を行う
  if (fileExt === "svg") {
    const svgData = await fs.readFile(srcPath, "utf8");
    const optimizedSvg = optimize(svgData, {
      multipass: true,
      datauri: "unenc",
      plugins: [
        "preset-default",
        "removeComments",
        "cleanupAttrs",
        "removeRasterImages",
        "removeXMLNS",
      ],
    });

    // 出力先のパスを生成（ディレクトリ構造を維持）
    const distPath = path.join(
      distImagesDir,
      path.relative(srcImagesDir, srcPath)
    );

    await fs.mkdir(path.dirname(distPath), { recursive: true });
    await fs.writeFile(distPath, optimizedSvg.data);

    const srcSize = (await fs.stat(srcPath)).size;
    const distSize = (await fs.stat(distPath)).size;
    Logger.log(
      "INFO",
      `Optimized SVG: ${srcPath} (${(srcSize / 1024).toFixed(
        2
      )}KB) -> ${distPath} (${(distSize / 1024).toFixed(2)}KB)`
    );
    return;
  }

  // その他の画像ファイルの処理
  let processedDistPath = path.join(
    distImagesDir,
    path.relative(srcImagesDir, distPath)
  );
  let outputFormat = fileExt;

  if (convertToWebp) {
    processedDistPath = `${processedDistPath.slice(
      0,
      -path.extname(processedDistPath).length
    )}.webp`;
    outputFormat = "webp";
  }

  await fs.mkdir(path.dirname(processedDistPath), { recursive: true });
  await sharp(srcPath)
    .resize({ width: maxWidth, height: null, withoutEnlargement: true })
    .toFormat(outputFormat, { quality: imageQuality })
    .toFile(processedDistPath);

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
    const srcGlob = path.join(srcImagesDir, "/**/*").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob, { nodir: true });

    if (srcPaths.length === 0) {
      Logger.log("WARN", `No image files found in ${srcImagesDir}`);
      return;
    }

    await fs.mkdir(distImagesDir, { recursive: true });

    for (const srcPath of srcPaths) {
      const distPath = path.join(
        distImagesDir,
        path.relative(srcImagesDir, srcPath)
      );

      await fs.mkdir(path.dirname(distPath), { recursive: true });
      await processImageFile(srcPath, distPath);
    }

    Logger.log("INFO", "Image files processed successfully.");
  } catch (err) {
    Logger.log("ERROR", err);
  }
}

main();
