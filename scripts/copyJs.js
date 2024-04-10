import { copyDir } from "./common/copyDir.js";

// 再帰的にファイルをコピーする
await copyDir("src/js", "../assets/js");
