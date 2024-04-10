// common/copyFiles.js
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";

const copyFiles = async (srcDir, distDir, extension = null) => {
  try {
    // ソースディレクトリ内のすべてのファイルのパスを取得
    const srcGlob = extension
      ? path.join(srcDir, "**", `*.${extension}`).replace(/\\/g, "/")
      : path.join(srcDir, "**", "*").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob);

    // ソースディレクトリ内にファイルがない場合は警告を表示して処理を終了
    if (srcPaths.length === 0) {
      console.warn(chalk.yellow(`Warning: No files found in ${srcDir}`));
      return;
    }

    // 出力先ディレクトリが存在しない場合は作成
    await fs.mkdir(distDir, { recursive: true });

    // 各ファイルをコピー
    for (const srcPath of srcPaths) {
      try {
        // ファイルの内容を読み込む
        const srcCode = await fs.readFile(srcPath, "utf-8");
        // 出力先ファイル名を取得
        const distFileName = path.basename(srcPath);
        // 出力先ファイルのパスを生成
        const distPath = path.join(distDir, distFileName);
        // ファイルを出力先ディレクトリに書き込む
        await fs.writeFile(distPath, srcCode);
        console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
      } catch (err) {
        console.error(`${chalk.red("Error:")} Failed to copy ${srcPath}: ${err}`);
      }
    }
  } catch (err) {
    console.error(`${chalk.red("Error:")} ${err}`);
    process.exit(1);
  }
};

export { copyFiles };
