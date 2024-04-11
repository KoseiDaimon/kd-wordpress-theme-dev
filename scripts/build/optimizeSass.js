import { config } from "../../config.js";
import Logger from "../utils/Logger.js";
import ScssProcessor from "../utils/ScssProcessor.js";
import PostCssProcessor from "../utils/PostCssProcessor.js";
import CleanCssProcessor from "../utils/CleanCssProcessor.js";

// ソースディレクトリと出力ディレクトリを設定
const srcDir = config.src.sass;
const distDir = config.dist.css;

// ScssProcessor インスタンスを作成
const scssProcessor = new ScssProcessor(srcDir, distDir);

// PostCssProcessor インスタンスを作成
const postCssProcessor = new PostCssProcessor(distDir);

// CleanCssProcessor インスタンスを作成
const cleanCssProcessor = new CleanCssProcessor(distDir);

// メイン処理
(async () => {
  try {
    // インデックスファイルを生成
    await scssProcessor.generateIndexFiles();

    // SCSSをコンパイル
    await scssProcessor.compileFiles();

    // CSSを最適化
    await postCssProcessor.optimizeCssFiles();

    // CSSを圧縮
    cleanCssProcessor.minifyCssFiles();
  } catch (err) {
    Logger.log("ERROR", "Error creating index files or compiling SCSS:", err);
    throw err;
  }
})();
