// scripts/dev/syncJs.js
import FileSystemHelper from "../utils/FileSystemHelper.js";

const srcDir = "./src/images";
const distDir = "./assets/images";

const imagesHelper = new FileSystemHelper(srcDir, distDir);
imagesHelper.watchFiles();
