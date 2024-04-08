// scripts/sass.js
import * as sass from "sass";
import config from '../config.json' assert { type: 'json' };
import fs from "fs";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import postcssSortMediaQueries from "postcss-sort-media-queries";
import cssDeclarationSorter from "css-declaration-sorter";
import postcssNormalizeCharset from "postcss-normalize-charset";
import chokidar from "chokidar";

async function compileSass() {
  try {
    const result = sass.compile(config.src.sass);
    const cssContent = result.css;

    const plugins = [
      autoprefixer,
      postcssSortMediaQueries,
      cssDeclarationSorter,
      postcssNormalizeCharset,
    ];

    const processedCss = await postcss(plugins).process(cssContent, {
      from: undefined,
    });

    fs.writeFileSync(config.dist.css, processedCss.css);
    console.log('SASS compiled successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

const watch = process.argv.includes('--watch');

if (watch) {
  chokidar.watch(config.src.sass).on('change', (filePath) => {
    console.log(`File ${filePath} changed`);
    compileSass();
  });
  console.log('Watching for changes...');
} else {
  compileSass();
}