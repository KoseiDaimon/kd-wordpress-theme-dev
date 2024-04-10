// 必要なモジュールをインポート
import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import PostCssProcessor from "../utils/PostCssProcessor.js";
import ScssProcessor from "../utils/ScssProcessor.js";

// ソースディレクトリと出力ディレクトリを設定
const srcDir = "./src/scss";
const distDir = "./assets/css";

// ScssProcessor インスタンスを作成
const scssProcessor = new ScssProcessor(srcDir, distDir);

// PostCssProcessor インスタンスを作成
const postCssProcessor = new PostCssProcessor(srcDir, distDir);

// 単一のSCSSファイルをコンパイルする関数
const processScssFile = async (srcPath, distDir) => {
  const distFileName = path.basename(srcPath, ".scss") + ".css";
  const distPath = path.join(distDir, distFileName);

  try {
    // SCSSをコンパイル
    const result = await sass.compileAsync(srcPath);

    // PostCSSプラグインを適用
    const minifiedCss = await postCssProcessor.processCSS(result.css, srcPath, distPath);

    // ミニファイ化されたCSSを書き込み
    await fs.writeFile(distPath, minifiedCss);
    console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
  } catch (err) {
    console.error(`${chalk.red("Error:")} Failed to compile ${srcPath}: ${err}`);
  }
};

// メイン処理
(async () => {
  try {
    // インデックスファイルを生成
    await scssProcessor.generateIndexFiles();

    // SCSSをコンパイル
    await scssProcessor.compile();
    console.log(chalk.green("[Success] SCSS compilation completed."));
  } catch (err) {
    console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
    process.exit(1);
  }
})();
