const sass = require('sass');
const fs = require('fs/promises');
const path = require('path');
const glob = require('glob');

const scssGlob = './src/scss/**/*.scss';
const cssOutputDir = './assets/css';

glob(scssGlob, {}, async (err, scssFilePaths) => {
  if (err) {
    console.error(err);
    return;
  }

  for (const scssFilePath of scssFilePaths) {
    const cssFilePath = `${cssOutputDir}/${path.basename(scssFilePath, '.scss')}.css`;

    try {
      const result = await sass.compileAsync(scssFilePath);
      await fs.writeFile(cssFilePath, result.css);
      console.log(`${scssFilePath} has been compiled to ${cssFilePath}`);
    } catch (err) {
      console.error(`Failed to compile ${scssFilePath}: ${err}`);
    }
  }
});