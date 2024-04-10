// scripts/build/optimizeSass.js
import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";
import { generateIndexFiles } from "../common/generateIndexFiles.js";

// SCSS ファイルのディレクトリと CSS ファイルの出力先ディレクトリを設定
const srcDir = "./src/scss";
const distDir = "./assets/css";

// SCSS ファイルをコンパイルする関数
const compileScss = async (srcDir, distDir) => {
  try {
    // SCSS ファイルのパスパターンを作成
    const srcGlob = path.join(srcDir, "**", "*.scss").replace(/\\/g, "/");
    // パターンにマッチする SCSS ファイルのパスを取得
    const srcPaths = await glob(srcGlob);

    // SCSS ファイルが見つからない場合は警告を表示して関数を終了
    if (srcPaths.length === 0) {
      console.warn(chalk.yellow(`Warning: No SCSS files found in ${srcDir}`));
      return;
    }

    // 出力先ディレクトリを作成 (存在しない場合)
    await fs.mkdir(distDir, { recursive: true });

    // 各 SCSS ファイルに対して処理を実行
    for (const srcPath of srcPaths) {
      // "_" で始まるファイル (パーシャル) はスキップ
      if (path.basename(srcPath).startsWith("_")) {
        continue;
      }

      // 出力先の CSS ファイル名を作成
      const distFileName = path.basename(srcPath, ".scss") + ".css";
      // 出力先の CSS ファイルのパスを作成
      const distPath = path.join(distDir, distFileName);

      try {
        // SCSS ファイルをコンパイル
        const result = await sass.compileAsync(srcPath);
        // コンパイル結果を CSS ファイルに書き込み
        await fs.writeFile(distPath, result.css);
        // 成功メッセージを表示
        console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
      } catch (err) {
        // コンパイル エラーが発生した場合はエラーメッセージを表示
        console.error(`${chalk.red("Error:")} Failed to compile ${srcPath}: ${err}`);
      }
    }
  } catch (err) {
    // その他のエラーが発生した場合はエラーメッセージを表示して終了
    console.error(`${chalk.red("Error:")} ${err}`);
    process.exit(1);
  }
};

// 即時実行関数 (IIFE) でスクリプトを実行
(async () => {
  try {
    // インデックス ファイルを生成
    await generateIndexFiles(srcDir);
    // インデックス ファイルの生成成功メッセージを表示
    console.log(chalk.green("[Success] Index files created successfully."));

    // SCSS ファイルをコンパイル
    await compileScss(srcDir, distDir);
    // SCSS コンパイルの完了メッセージを表示
    console.log(chalk.green("[Success] SCSS compilation completed."));
  } catch (err) {
    // インデックス ファイルの生成または SCSS コンパイル中にエラーが発生した場合のエラーメッセージを表示
    console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
    process.exit(1);
  }
})();
