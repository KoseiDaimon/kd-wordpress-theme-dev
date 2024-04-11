import fs from "fs/promises";
import { config } from "../../config.js";
import Logger from "../utils/Logger.js";

// 削除対象のディレクトリを指定
const distDirs = Object.values(config.dist);

async function removeDirectories() {
  for (const distDir of distDirs) {
    try {
      // ディレクトリが存在するかどうかを確認
      const stats = await fs.stat(distDir);
      if (stats.isDirectory()) {
        // ディレクトリを再帰的に削除
        await fs.rm(distDir, { recursive: true });
        // 削除成功のメッセージを表示
        Logger.log("INFO", `Removed directory ${distDir}`);
      } else {
        // ディレクトリではない場合のメッセージを表示
        Logger.log("DEBUG", `${distDir} is not a directory`);
      }
    } catch (err) {
      // エラーが発生した場合の処理
      if (err.code === "ENOENT") {
        // ディレクトリが存在しない場合のメッセージを表示
        Logger.log("DEBUG", `Directory ${distDir} does not exist`);
      } else {
        // その他のエラーが発生した場合のメッセージを表示
        Logger.log("ERROR", `Error removing directory ${distDir}`);
        // エラーの詳細を表示
        Logger.log("ERROR", err);
        // エラーをスローして処理を中断
        throw err;
      }
    }
  }

  // すべてのディレクトリが正常に削除された場合のメッセージを表示
  Logger.log("INFO", "All directories removed successfully");
}

// 非同期関数を呼び出してエラー処理を行う
removeDirectories().catch((err) => {
  // エラーが発生した場合の処理
  Logger.log("ERROR", "An error occurred while removing directories");
  Logger.log("ERROR", err);
  // プロセスを終了
  process.exit(1);
});
