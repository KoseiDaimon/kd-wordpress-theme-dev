// scripts/dev/syncJs.js
import FileSystemHelper from "../utils/FileSystemHelper.js";

const srcDir = "./src/js";
const distDir = "./assets/js";

const jsHelper = new FileSystemHelper(srcDir, distDir);
jsHelper.watchFiles();
