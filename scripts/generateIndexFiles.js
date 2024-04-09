// scripts/generateIndexFiles.js

import path from "path";
import fs from "fs/promises";
import chalk from "chalk";

// SCSS パーシャルファイルかどうかを判定する関数
const isScssPartial = (fileName) => {
  // ファイル名が ".scss" で終わり、"_" で始まり、"_index.scss" ではない場合、SCSS パーシャルファイルと判定
  return fileName.endsWith(".scss") && fileName.startsWith("_") && fileName !== "_index.scss";
};

// インデックスファイルの内容を生成する関数
const createIndexContent = (scssFiles) => {
  // インデックスファイルの内容を配列で作成
  return [
    "// This file is generated automatically by scripts/generateIndexFiles.js",
    // 各 SCSS パーシャルファイルを @forward ディレクティブでインポート
    ...scssFiles.map((file) => `@forward "./${file.slice(0, -5)}";`),
  ].join("\n"); // 配列の要素を改行で結合して文字列に変換
};

// インデックスファイルを生成する関数
export const generateIndexFiles = async (dir) => {
  try {
    // ディレクトリ内のファイル一覧を取得
    const files = await fs.readdir(dir);
    // SCSS パーシャルファイルのみをフィルタリング
    const scssFiles = files.filter(isScssPartial);

    // ディレクトリ内の各ファイルに対して処理を行う
    for (const file of files) {
      // ファイルの絶対パスを作成
      const filePath = path.join(dir, file);
      // ファイルの情報を取得
      const stat = await fs.stat(filePath);

      // ファイルがディレクトリの場合、再帰的に generateIndexFiles 関数を呼び出す
      if (stat.isDirectory()) {
        await generateIndexFiles(filePath);
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
};
