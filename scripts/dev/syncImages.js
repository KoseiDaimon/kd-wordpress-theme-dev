// scripts/dev/syncJs.js
import FileSystemHelper from "../utils/FileSystemHelper.js";
import { config } from "../../config.js";

const srcDir = config.src.images;
const distDir = config.dist.images;

const imagesHelper = new FileSystemHelper(srcDir, distDir);
imagesHelper.watchFiles();
