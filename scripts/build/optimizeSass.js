import { config } from "../../config.js";
import Logger from "../utils/Logger.js";
import ScssProcessor from "../utils/ScssProcessor.js";
import PostCssProcessor from "../utils/PostCssProcessor.js";

// ソースディレクトリと出力ディレクトリを設定
const srcDir = config.src.sass;
const distDir = config.dist.css;

// 圧縮するかどうか取得
const minifyCss = config.options.minifyCss !== false;

// ScssProcessor インスタンスを作成
const scssProcessor = new ScssProcessor(srcDir, distDir);

// PostCssProcessor インスタンスを作成
const postCssProcessor = new PostCssProcessor(distDir);

// メイン処理
(async () => {
  try {
    // インデックスファイルを生成
    await scssProcessor.generateIndexFiles();

    // SCSSをコンパイル
    await scssProcessor.compileFiles();

    // CSSを最適化
    await postCssProcessor.optimizeCssFiles();

    if (minifyCss) {
      // CSSを圧縮
      await postCssProcessor.minifyCssFiles();
    }
  } catch (err) {
    Logger.log("ERROR", "Error creating index files or compiling SCSS:", err);
    throw err;
  }
})();
