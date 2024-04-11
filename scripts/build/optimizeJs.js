// scripts/build/optimizeJs.js
import * as terser from "terser";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";

// ソースのディレクトリと、出力先ディレクトリを設定
const srcDir = "./src/js";
const distDir = "./assets/js";

// JavaScriptファイルを最適化する関数
const optimizeJs = async (srcDir, distDir) => {
  try {
    // ソースディレクトリ内のすべてのJavaScriptファイルのパスを取得
    const srcGlob = path.join(srcDir, "**", "*.js").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob, { nodir: true });

    // ソースディレクトリ内にJavaScriptファイルがない場合は警告を表示して処理を終了
    if (srcPaths.length === 0) {
      console.warn(chalk.yellow(`Warning: No JavaScript files found in ${srcDir}`));
      return;
    }

    // 出力先ディレクトリが存在しない場合は作成
    await fs.mkdir(distDir, { recursive: true });

    // 各JavaScriptファイルを最適化
    for (const srcPath of srcPaths) {
      try {
        // ファイルの内容を読み込む
        const srcCode = await fs.readFile(srcPath, "utf-8");
        // JavaScriptコードを最適化
        const result = await terser.minify(srcCode, {
          ecma: 2020,
          compress: {
            passes: 5,
          },
          mangle: true,
        });

        // 最適化に失敗した場合はエラーメッセージを表示して次のファイルに進む
        if (result.error) {
          console.error(`${chalk.red("Error:")} Failed to optimize ${srcPath}: ${result.error}`);
          continue;
        }

        // 出力先ファイル名を取得
        const distFileName = path.basename(srcPath);
        // 出力先ファイルのパスを生成
        const distPath = path.join(distDir, distFileName);
        // 最適化されたコードを出力先ディレクトリに書き込む
        await fs.writeFile(distPath, result.code);

        // 成功メッセージと最適化後のファイルサイズを表示
        console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
        console.log(
          chalk.green("File size: ") + chalk.bold(`${(result.code.length / 1024).toFixed(2)} KB`)
        );
      } catch (err) {
        console.error(`${chalk.red("Error:")} Failed to optimize ${srcPath}: ${err}`);
      }
    }
  } catch (err) {
    console.error(`${chalk.red("Error:")} ${err}`);
    process.exit(1);
  }
};

try {
  await optimizeJs(srcDir, distDir);
  console.log(chalk.green("JavaScript files optimized successfully."));
} catch (err) {
  console.error(`${chalk.red("Error:")} ${err}`);
  process.exit(1);
}
