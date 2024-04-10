// scripts/dev/syncJs.js
import { DirectorySync } from "../utils/DirectorySync.js";

const srcDir = "./src/js";
const distDir = "./assets/js";

const dirSync = new DirectorySync(srcDir, distDir);
dirSync.watchFiles();
