import { config } from "../../config.js";
import browserSync from "browser-sync";
import Logger from "../utils/Logger.js";

const serverUrl = config.server.url || "http://localhost:8000";
Logger.log("INFO", `Starting Browser Sync with proxy: ${serverUrl}`);

browserSync.init({
  proxy: serverUrl,
  files: ["./assets/**/*", "./*.php", "./**/*.php"],
});
