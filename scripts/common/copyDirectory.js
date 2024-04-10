// common/copyDirectory.js
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";

const copyDirectory = async (srcDir, distDir) => {
  try {
    // ソースディレクトリ内のすべてのファイルとディレクトリのパスを取得
    const srcGlob = path.join(srcDir, "**", "*").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob);

    // ソースディレクトリ内にファイルがない場合は警告を表示して処理を終了
    if (srcPaths.length === 0) {
      console.warn(chalk.yellow(`Warning: No files found in ${srcDir}`));
      return;
    }

    // 出力先ディレクトリが存在しない場合は作成
    await fs.mkdir(distDir, { recursive: true });

    // 各ファイルとディレクトリをコピー
    for (const srcPath of srcPaths) {
      try {
        // ファイルまたはディレクトリの情報を取得
        const stats = await fs.stat(srcPath);

        // ディレクトリの場合はコピー処理をスキップ
        if (stats.isDirectory()) {
          console.log(`${chalk.blue("Skipping directory:")} ${srcPath}`);
          continue;
        }

        // ファイルの内容を読み込む
        const srcCode = await fs.readFile(srcPath);

        // 出力先ファイルのパスを生成
        const distPath = path.join(distDir, path.relative(srcDir, srcPath));

        // 出力先ディレクトリが存在しない場合は作成
        await fs.mkdir(path.dirname(distPath), { recursive: true });

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

export { copyDirectory };
