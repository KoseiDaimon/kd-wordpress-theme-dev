// main.js
import { config } from "../../config.js";
import JsProcessor from "../utils/JsProcessor.js";
import Logger from "../utils/Logger.js";

const srcDir = config.src.js;
const distDir = config.dist.js;

(async () => {
  try {
    const jsProcessor = new JsProcessor(srcDir, distDir);
    await jsProcessor.processJsFiles();
    Logger.log("INFO", "JavaScript files optimized successfully.");
  } catch (err) {
    Logger.log("ERROR", "Error processing JavaScript files:", err);
    throw err;
  }
})();
