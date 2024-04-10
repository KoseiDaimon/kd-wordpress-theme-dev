// scripts/optimizeSass.js
import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";
import chokidar from "chokidar";
import { generateIndexFiles } from "../utils/generateIndexFiles.js";

// コマンドライン引数に "--watch" が含まれているかどうかを確認
const watch = process.argv.includes("--watch");

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

// ファイルの変更を処理する関数
const handleChange = (changedFilePath) => {
  // 変更されたファイルのディレクトリを取得
  const changedDirPath = path.dirname(changedFilePath);

  // インデックス ファイルを生成
  generateIndexFiles(changedDirPath)
    .then(() => {
      // インデックス ファイルの生成に成功したことを示すメッセージを表示
      console.log(chalk.green(`[Success] Index files created successfully for ${changedDirPath}.`));
      // SCSS ファイルをコンパイル
      return compileScss(srcDir, distDir);
    })
    .then(() => {
      // SCSS コンパイルの完了メッセージを表示
      console.log(chalk.green("[Success] SCSS compilation completed."));
    })
    .catch((err) => {
      // インデックス ファイルの生成または SCSS コンパイル中にエラーが発生した場合のエラーメッセージを表示
      console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
    });
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

    // "--watch" オプションが指定されている場合
    if (watch) {
      // ファイル監視のためのオプションを設定
      const watcher = chokidar.watch(srcDir, {
        ignored: [/(^|[/\\])\../, /_index\.scss$/, /\.css$/],
        persistent: true,
        ignoreInitial: true,
      });

      // ファイルの変更イベントを監視
      watcher.on("change", (path) => {
        // ファイル変更検出メッセージを表示
        console.log(`${chalk.blue("Change detected:")} ${path}`);
        // 変更されたファイルを処理
        handleChange(path);
      });

      // ファイルの追加イベントを監視
      watcher.on("add", (path) => {
        // ファイル追加メッセージを表示
        console.log(`${chalk.blue("File added:")} ${path}`);
        // 追加されたファイルを処理
        handleChange(path);
      });

      // ファイルの削除イベントを監視
      watcher.on("unlink", (path) => {
        // ファイル削除メッセージを表示
        console.log(`${chalk.blue("File removed:")} ${path}`);
        // 削除されたファイルを処理
        handleChange(path);
      });

      // ファイル監視の開始メッセージを表示
      console.log(chalk.blue("Watching SCSS for changes..."));
    }
  } catch (err) {
    // インデックス ファイルの生成または SCSS コンパイル中にエラーが発生した場合のエラーメッセージを表示
    console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
    process.exit(1);
  }
})();
