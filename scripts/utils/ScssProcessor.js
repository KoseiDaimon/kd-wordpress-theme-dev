import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import { glob } from "glob";

// インデックスファイルの内容を生成する関数
const createIndexContent = (scssFiles) => {
  // インデックスファイルの内容を配列で作成
  return [
    "// This file is generated automatically by scripts/generateIndexFiles.js",
    // 各 SCSS パーシャルファイルを @forward ディレクティブでインポート
    ...scssFiles.map((file) => `@forward "./${file.slice(0, -5)}";`),
  ].join("\n"); // 配列の要素を改行で結合して文字列に変換
};

// SCSS プロセッサクラス
export default class ScssProcessor {
  constructor(srcDir, distDir) {
    this.srcDir = srcDir;
    this.distDir = distDir;
  }
  // インデックスファイルを生成するメソッド
  async generateIndexFiles(dir = this.srcDir) {
    try {
      // ディレクトリ内のファイル一覧を取得
      const files = await fs.readdir(dir);
      // SCSS パーシャルファイルのみをフィルタリング
      const scssFiles = files.filter(
        (file) => file.endsWith(".scss") && file.startsWith("_") && file !== "_index.scss"
      );

      // ディレクトリ内の各ファイルに対して処理を行う
      for (const file of files) {
        // ファイルの絶対パスを作成
        const filePath = path.join(dir, file);
        // ファイルの情報を取得
        const stat = await fs.stat(filePath);
        // ファイルがディレクトリの場合、再帰的に generateIndexFiles メソッドを呼び出す
        if (stat.isDirectory()) {
          await this.generateIndexFiles(filePath);
        }
      }

      // SCSS パーシャルファイルが存在しない場合、処理を終了
      if (scssFiles.length === 0) {
        return;
      }

      // インデックスファイルの絶対パスを作成
      const indexFilePath = path.join(dir, "_index.scss");
      // インデックスファイルの内容を生成
      const indexContent = createIndexContent(scssFiles);

      try {
        // インデックスファイルが既に存在するかどうかを確認
        await fs.access(indexFilePath);
        // 既に存在する場合、上書きする旨のメッセージを表示
        console.log(`${chalk.blue("Info:")} Overwriting existing ${indexFilePath}`);
      } catch {
        // 存在しない場合、新規作成する旨のメッセージを表示
        console.log(`${chalk.green("Success:")} Generating new ${indexFilePath}`);
      }

      // インデックスファイルを書き込む
      await fs.writeFile(indexFilePath, indexContent);
    } catch (error) {
      // エラーが発生した場合、エラーメッセージを表示
      console.error(`${chalk.red("Error:")} Error generating index file in ${dir}`);
      console.error(error);
    }
  }

  async compileFiles(options = {}) {
    const { sourceMap = false } = options;

    try {
      // SCSS ファイルのパスパターンを作成
      const srcGlob = path.join(this.srcDir, "**", "*.scss").replace(/\\/g, "/");

      // パターンにマッチする SCSS ファイルのパスを取得
      const srcPaths = await glob(srcGlob);

      // SCSS ファイルが見つからない場合は警告を表示して関数を終了
      if (srcPaths.length === 0) {
        console.warn(chalk.yellow(`Warning: No SCSS files found in ${this.srcDir}`));
      } else {
        // 出力先ディレクトリを作成 (存在しない場合)
        await fs.mkdir(this.distDir, { recursive: true });

        // 各 SCSS ファイルに対して処理を実行
        for (const srcPath of srcPaths) {
          // "_" で始まるファイル (パーシャル) はスキップ
          if (path.basename(srcPath).startsWith("_")) {
            continue;
          }

          // 出力先の CSS ファイル名を作成
          const distFileName = path.basename(srcPath, ".scss") + ".css";
          // 出力先の CSS ファイルのパスを作成
          const distPath = path.join(this.distDir, distFileName);
          // 出力先のソースマップファイル名を作成
          const mapFileName = path.basename(srcPath, ".scss") + ".css.map";
          // 出力先のソースマップファイルのパスを作成
          const mapPath = path.join(this.distDir, mapFileName);

          try {
            // ソースマップの設定を決定
            const sourceMapOptions = {
              sourceMap: sourceMap,
            };

            // SCSS ファイルをコンパイル
            const result = await sass.compileAsync(srcPath, sourceMapOptions);

            // コンパイル結果を CSS ファイルに書き込み
            await fs.writeFile(distPath, result.css);

            // ソースマップが有効な場合はソースマップを処理
            if (sourceMap) {
              // ソースマップのコメントを CSS ファイルに追加
              const sourceMapComment = `/*# sourceMappingURL=${mapFileName} */`;
              await fs.appendFile(distPath, sourceMapComment);
              // ソースマップを別ファイルに書き込み
              await fs.writeFile(mapPath, JSON.stringify(result.sourceMap));
            }

            // 成功メッセージを表示
            console.log(`${chalk.green("Success:")} ${srcPath} -> ${distPath}`);
          } catch (err) {
            // コンパイル エラーが発生した場合はエラーメッセージを表示
            console.error(`${chalk.red("Error:")} Failed to compile ${srcPath}: ${err}`);
          }
        }

        // SCSS コンパイルの完了メッセージを表示
        console.log(chalk.green("[Success] SCSS compilation completed."));
      }
    } catch (err) {
      // その他のエラーが発生した場合はエラーメッセージを表示して終了
      console.error(`${chalk.red("Error:")} ${err}`);
      process.exit(1);
    }
  }
}
