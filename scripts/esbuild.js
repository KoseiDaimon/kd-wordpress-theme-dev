import esbuild from 'esbuild';
import config from '../config.json' assert { type: 'json' };

const watch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: [config.src.js],
  outfile: `${config.dist.js}/${config.options.jsOutputFileName}`,
  bundle: true,
  minify: true,
};

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('変更を監視しています...');
} else {
  esbuild.build(buildOptions)
    .then(() => {
      console.log('JavaScriptビルドが完了しました。');
    })
    .catch((error) => {
      console.error('JavaScriptビルドに失敗しました:', error);
      process.exit(1);
    });
}