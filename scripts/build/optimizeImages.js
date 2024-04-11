import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { glob } from "glob";
import chalk from "chalk";

const srcDir = "./src/images";
const distDir = "./assets/images";
const supportedFormats = ["jpg", "jpeg", "png", "webp"];

// 画像ファイルのパスパターンを作成
const srcGlob = path.join(srcDir, "/**/*.{" + supportedFormats.join(",") + "}").replace(/\\/g, "/");

// パターンにマッチする画像ファイルのパスを取得
const srcPaths = await glob(srcGlob, { nodir: true });

// 画像ファイルが見つからない場合は警告を表示して処理を終了
if (srcPaths.length === 0) {
  console.warn(chalk.yellow(`Warning: No image files found in ${srcDir}`));
} else {
  await fs.mkdir(distDir, { recursive: true });

  // 各画像ファイルに対して処理を実行
  for (const srcPath of srcPaths) {
    const relPath = path.relative(srcDir, srcPath);
    const distPath = path.join(distDir, relPath);
    const fileExt = path.extname(srcPath).slice(1).toLowerCase();

    // 出力先ディレクトリを作成 (存在しない場合)
    await fs.mkdir(path.dirname(distPath), { recursive: true });

    // 画像を最適化して出力する
    sharp(srcPath)
      .resize({ width: 800, withoutEnlargement: true })
      .toFormat(fileExt === "jpg" || fileExt === "jpeg" ? "jpeg" : fileExt, { quality: 80 })
      .toFile(distPath)
      .then(() => {
        console.log(
          `${chalk.green("Success:")} Optimized image ${srcPath} -> ${chalk.magenta(distPath)}`
        );
      })
      .catch((err) => {
        console.error(`Error occurred while optimizing ${relPath}:`, err);
      });
  }
}
