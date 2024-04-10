import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import { glob } from "glob";

// SCSS コンパイラクラス
export default class ScssCompiler {
  constructor(srcDir, distDir) {
    this.srcDir = srcDir;
    this.distDir = distDir;
  }

  async compile() {
    try {
      // SCSS ファイルのパスパターンを作成
      const srcGlob = path.join(this.srcDir, "**", "*.scss").replace(/\\/g, "/");
      console.log(srcGlob);
      // パターンにマッチする SCSS ファイルのパスを取得
      const srcPaths = await glob(srcGlob);
      console.log(srcPaths);

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
            // SCSS ファイルをコンパイル (ソースマップを生成)
            const result = await sass.compileAsync(srcPath, {
              sourceMap: mapPath,
              sourceMapContents: true,
            });

            // コンパイル結果を CSS ファイルに書き込み
            await fs.writeFile(distPath, result.css);
            // ソースマップのコメントを CSS ファイルに追加
            const sourceMapComment = `/*# sourceMappingURL=${mapFileName} */`;
            await fs.appendFile(distPath, sourceMapComment);
            // ソースマップを別ファイルに書き込み
            await fs.writeFile(mapPath, JSON.stringify(result.sourceMap));

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
