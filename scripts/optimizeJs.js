import * as terser from "terser";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import chalk from "chalk";
import chokidar from "chokidar";

// コマンドライン引数に "--watch" が含まれているかどうかを確認
const watch = process.argv.includes("--watch");

// ソースのディレクトリと、出力先ディレクトリを設定
const srcDir = "./src/js";
const distDir = "./assets/js";

// JavaScriptファイルをコピーする関数
const copyJs = async (srcDir, distDir) => {
  try {
    // ソースディレクトリ内のすべてのJavaScriptファイルのパスを取得
    const srcGlob = path.join(srcDir, "**", "*.js").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob);

    // ソースディレクトリ内にJavaScriptファイルがない場合は警告を表示して処理を終了
    if (srcPaths.length === 0) {
      console.warn(chalk.yellow(`Warning: No JavaScript files found in ${srcDir}`));
      return;
    }

    // 出力先ディレクトリが存在しない場合は作成
    await fs.mkdir(distDir, { recursive: true });

    // 各JavaScriptファイルをコピー
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

// JavaScriptファイルを最適化する関数
const optimizeJs = async (srcDir, distDir) => {
  try {
    // ソースディレクトリ内のすべてのJavaScriptファイルのパスを取得
    const srcGlob = path.join(srcDir, "**", "*.js").replace(/\\/g, "/");
    const srcPaths = await glob(srcGlob);

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

// ファイルの変更を処理する関数
const handleChange = (changedFilePath) => {
  try {
    // 変更されたファイルのディレクトリを取得
    const changedDirPath = path.dirname(changedFilePath);

    // 変更されたディレクトリ内のJavaScriptファイルを最適化
    copyJs(changedDirPath, distDir);
  } catch (err) {
    console.error(`${chalk.red("Error:")} Failed to handle file change: ${err}`);
  }
};

// ファイルの監視を開始する関数
const watchFiles = () => {
  try {
    // ファイル監視のためのオプションを設定
    const watcher = chokidar.watch(srcDir, {
      ignored: [/(^|\/)\.$/, /node_modules/], // 隠しファイルとnode_modulesディレクトリを無視
      persistent: true, // プロセスが終了しても監視を続ける
      ignoreInitial: true, // 初期スキャンを無視
    });

    // ファイルの変更イベントを監視
    watcher.on("change", (path) => {
      console.log(`${chalk.blue("Change detected:")} ${path}`);
      handleChange(path);
    });

    // ファイルの追加イベントを監視
    watcher.on("add", (path) => {
      console.log(`${chalk.blue("File added:")} ${path}`);
      handleChange(path);
    });

    // ファイルの削除イベントを監視
    watcher.on("unlink", (path) => {
      console.log(`${chalk.blue("File removed:")} ${path}`);
      handleChange(path);
    });

    console.log(chalk.blue("Watching JavaScript for changes..."));
  } catch (err) {
    console.error(`${chalk.red("Error:")} Failed to start file watcher: ${err}`);
    process.exit(1);
  }
};

try {
  // コマンドライン引数に "--watch" が含まれている場合はファイル監視を開始
  if (watch) {
    copyJs(srcDir, distDir);
    watchFiles();
  } else {
    // コマンドライン引数に "--watch" が含まれていない場合はJavaScriptファイルを最適化
    optimizeJs(srcDir, distDir);
  }
} catch (err) {
  console.error(`${chalk.red("Error:")} ${err}`);
  process.exit(1);
}
