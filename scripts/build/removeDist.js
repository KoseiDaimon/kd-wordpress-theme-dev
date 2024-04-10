import { rm } from "fs/promises";
import chalk from "chalk";

// 削除対象のディレクトリを指定
const distDir = "./assets";

try {
  // ディレクトリを再帰的に削除
  await rm(distDir, { recursive: true });

  // 削除成功のメッセージを表示
  console.log(`${chalk.green("Success:")} Removed directory ${distDir}`);
} catch (err) {
  // エラーが発生した場合の処理

  if (err.code === "ENOENT") {
    // ディレクトリが存在しない場合のメッセージを表示
    console.log(`${chalk.blue("Info:")} Directory ${distDir} does not exist`);
  } else {
    // その他のエラーが発生した場合のメッセージを表示
    console.error(`${chalk.red("Error:")} Error removing directory ${distDir}`);
    // エラーの詳細を表示
    console.error(err);
  }
}
