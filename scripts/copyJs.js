import { copyDir } from "./utils/copyDir.js";

// 再帰的にファイルをコピーする
await copyDir('src/js', '../assets/js');