// scripts/dev/syncJs.js
import FileSystemHelper from "../utils/FileSystemHelper.js";
import { config } from "../../config.js";

const srcDir = config.src.js;
const distDir = config.dist.js;

const jsHelper = new FileSystemHelper(srcDir, distDir);
jsHelper.watchFiles();
