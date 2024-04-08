const fs = require('fs-extra');

// 再帰的にディレクトリを削除する
fs.remove('../assets')
  .then(() => console.log('ディレクトリの削除が完了しました'))
  .catch(err => console.error(err));