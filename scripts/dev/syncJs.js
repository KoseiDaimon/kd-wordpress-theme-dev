// scripts/dev/syncJs.js
import FileSystemHelper from "../utils/FileSystemHelper.js";

const srcDir = "./src/js";
const distDir = "./assets/js";

const fileSystemHelper = new FileSystemHelper(srcDir, distDir);
fileSystemHelper.watchFiles();
