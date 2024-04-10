// 必要なモジュールをインポート
import chalk from "chalk";
import PostCssProcessor from "../utils/PostCssProcessor.js";
import CleanCssProcessor from "../utils/CleanCssProcessor.js";
import ScssProcessor from "../utils/ScssProcessor.js";

// ソースディレクトリと出力ディレクトリを設定
const srcDir = "./src/scss";
const distDir = "./assets/css";

// ScssProcessor インスタンスを作成
const scssProcessor = new ScssProcessor(srcDir, distDir);

// PostCssProcessor インスタンスを作成
const postCssProcessor = new PostCssProcessor(distDir);

// CleanCssProcessor インスタンスを作成
const cleanCssProcessor = new CleanCssProcessor();

// メイン処理
(async () => {
  try {
    // インデックスファイルを生成
    await scssProcessor.generateIndexFiles();

    // SCSSをコンパイル
    await scssProcessor.compile();

    // CSSを最適化
    await postCssProcessor.processCSS();
  } catch (err) {
    console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
    process.exit(1);
  }
})();
