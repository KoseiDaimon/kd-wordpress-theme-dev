// 必要なモジュールをインポート
import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import postcssSortMediaQueries from "postcss-sort-media-queries";
import cssDeclarationSorter from "css-declaration-sorter";
import postcssNormalizeCharset from "postcss-normalize-charset";
import CleanCSS from "clean-css";
import ScssProcessor from "../utils/ScssProcessor.js";

// ソースディレクトリと出力ディレクトリを設定
const srcDir = "./src/scss";
const distDir = "./assets/css";

// ScssProcessor インスタンスを作成
const scssProcessor = new ScssProcessor(srcDir, distDir);

// PostCSSプラグインを設定
const postcssPlugins = [
  autoprefixer,
  postcssSortMediaQueries,
  cssDeclarationSorter({ order: "smacss" }),
  postcssNormalizeCharset,
];

// CleanCSSオプションを設定
const cleanCSS = new CleanCSS({
  level: {
    1: {
      specialComments: 0,
    },
  },
});

// 単一のSCSSファイルをコンパイルする関数
const processScssFile = async (srcPath, distDir) => {
  const distFileName = path.basename(srcPath, ".scss") + ".css";
  const distPath = path.join(distDir, distFileName);

  try {
    // SCSSをコンパイル
    const result = await sass.compileAsync(srcPath);

    // PostCSSプラグインを適用
    const processedCss = await postcss(postcssPlugins).process(result.css, {
      from: srcPath,
      to: distPath,
    });

    // CSSをミニファイ
    const minifiedCss = cleanCSS.minify(processedCss.css);

    // ミニファイ化されたCSSを書き込み
    await fs.writeFile(distPath, minifiedCss.styles);

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
