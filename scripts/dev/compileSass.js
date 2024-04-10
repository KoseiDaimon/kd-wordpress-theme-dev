// scripts/dev/compileSass.js
import path from "path";
import chalk from "chalk";
import chokidar from "chokidar";
import ScssProcessor from "../utils/ScssProcessor.js";

// SCSS ファイルのディレクトリと CSS ファイルの出力先ディレクトリを設定
const srcDir = "./src/scss";
const distDir = "./assets/css";

// ScssProcessor インスタンスを作成
const scssProcessor = new ScssProcessor(srcDir, distDir);

// ファイルの変更を処理する関数
const handleChange = async (changedFilePath) => {
  try {
    // 変更されたファイルのディレクトリを取得
    const changedDirPath = path.dirname(changedFilePath);

    // インデックス ファイルを生成
    await scssProcessor.generateIndexFiles(changedDirPath);

    // インデックス ファイルの生成に成功したことを示すメッセージを表示
    console.log(chalk.green(`[Success] Index files created successfully for ${changedDirPath}.`));

    // SCSS ファイルをコンパイル
    await scssProcessor.compile();

    // SCSS コンパイルの完了メッセージを表示
    console.log(chalk.green("[Success] SCSS compilation completed."));
  } catch (err) {
    // インデックス ファイルの生成または SCSS コンパイル中にエラーが発生した場合のエラーメッセージを表示
    console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
  }
};

// ファイルの監視を開始する関数
const watchFiles = () => {
  try {
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
  } catch (err) {
    console.error(`${chalk.red("Error:")} Failed to start file watcher: ${err}`);
    process.exit(1);
  }
};

try {
  // インデックス ファイルを生成
  await scssProcessor.generateIndexFiles();

  // インデックス ファイルの生成成功メッセージを表示
  console.log(chalk.green("[Success] Index files created successfully."));

  // SCSS ファイルをコンパイル
  await scssProcessor.compile();

  // ファイルの監視を開始
  watchFiles();
} catch (err) {
  // インデックス ファイルの生成または SCSS コンパイル中にエラーが発生した場合のエラーメッセージを表示
  console.error(chalk.red("[Error] Error creating index files or compiling SCSS:"), err);
  process.exit(1);
}
