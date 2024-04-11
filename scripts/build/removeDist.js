import { rm } from "fs/promises";
import { config } from "../../config.js";
import Logger from "../utils/Logger.js";

// 削除対象のディレクトリを指定
const distDir = "./assets";

try {
  // ディレクトリを再帰的に削除
  await rm(distDir, { recursive: true });
  // 削除成功のメッセージを表示
  Logger.log("INFO", `Removed directory ${distDir}`);
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
  }
}
