import chalk from "chalk";
import { config } from "../../config.js";

// ログレベルの有効値を定義
const validLogLevels = new Set(["ERROR", "WARN", "INFO", "DEBUG"]);

// 設定ファイルからログレベルを取得し、大文字に変換。無効な値の場合は'INFO'をデフォルトとする
const logLevel = validLogLevels.has(config.options.logLevel?.toUpperCase())
  ? config.options.logLevel.toUpperCase()
  : "INFO";

// ログレベルごとの色を定義
const logColors = {
  ERROR: chalk.red.bold,
  WARN: chalk.yellow,
  INFO: chalk.green,
  DEBUG: chalk.blue,
};

// ログレベルの優先度を定義
const logLevelValues = {
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

export default class Logger {
  static log(level, message) {
    // ログレベルに対応する色を取得し、ログメッセージを作成
    const logColor = logColors[level.toUpperCase()] || chalk.reset;
    const logMessage = `${logColor(`[${level.toUpperCase()}]`)} ${message}`;

    // 渡されたログレベルと設定されたログレベルの値を取得
    const levelValue = logLevelValues[level.toUpperCase()];
    const currentLogLevel = logLevelValues[logLevel];

    // 渡されたログレベルが有効で、かつ設定されたログレベル以上の場合にログを出力
    if (levelValue && levelValue <= currentLogLevel) {
      switch (level.toUpperCase()) {
        case "ERROR":
          console.error(logMessage);
          break;
        case "WARN":
        case "INFO":
        case "DEBUG":
          console.log(logMessage);
          break;
        default:
          // 無効なログレベルの場合は何もしない
          break;
      }
    }
  }
}
