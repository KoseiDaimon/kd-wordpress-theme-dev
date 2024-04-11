import * as sass from "sass";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";
import Logger from "../utils/Logger.js";

// SCSS プロセッサクラス
export default class ScssProcessor {
  constructor(srcDir, distDir) {
    this.srcDir = srcDir;
    this.distDir = distDir;
  }

  async #createIndexContent(scssFiles) {
    return [
      "// This file is generated automatically by scripts/generateIndexFiles.js",
      ...scssFiles.map((file) => `@forward "./${file.slice(0, -5)}";`),
    ].join("\n");
  }

  async #generateIndexFilesRecursive(dir) {
    const files = await fs.readdir(dir);
    const scssFiles = files.filter(
      (file) => file.endsWith(".scss") && file.startsWith("_") && file !== "_index.scss"
    );

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await this.#generateIndexFilesRecursive(filePath);
      }
    }

    if (scssFiles.length > 0) {
      const indexFilePath = path.join(dir, "_index.scss");
      const indexContent = this.#createIndexContent(scssFiles);

      try {
        await fs.access(indexFilePath);
        Logger.log("INFO", `Overwrited: ${indexFilePath}`);
      } catch {
        Logger.log("INFO", `Generating new ${indexFilePath}`);
      }

      await fs.writeFile(indexFilePath, await indexContent);
    }
  }

  async generateIndexFiles(dir = this.srcDir) {
    try {
      await this.#generateIndexFilesRecursive(dir);
      Logger.log("INFO", "Index files created successfully.");
    } catch (error) {
      Logger.log("ERROR", `Error generating index files: ${error.message}`);
      throw error;
    }
  }

  async compileFiles(options = {}) {
    const { sourceMap = false } = options;

    try {
      // SCSS ファイルのパスパターンを作成
      const srcGlob = path.join(this.srcDir, "**", "*.scss").replace(/\\/g, "/");

      // パターンにマッチする SCSS ファイルのパスを取得
      const srcPaths = await glob(srcGlob, { nodir: true });

      // SCSS ファイルが見つからない場合は警告を表示して関数を終了
      if (srcPaths.length === 0) {
        Logger.log("WARN", `No SCSS files found in ${this.srcDir}`);
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
            Logger.log("INFO", `Compiled: ${srcPath} -> ${distPath}`);
          } catch (err) {
            // コンパイル エラーが発生した場合はエラーメッセージを表示
            Logger.log("ERROR", `Failed to compile ${srcPath}: ${err}`);
          }
        }

        // SCSS コンパイルの完了メッセージを表示
        Logger.log("INFO", "SCSS compilation completed successfully.");
      }
    } catch (err) {
      // その他のエラーが発生した場合はエラーメッセージを表示して終了
      Logger.log("ERROR", err);
      throw err;
    }
  }
}
