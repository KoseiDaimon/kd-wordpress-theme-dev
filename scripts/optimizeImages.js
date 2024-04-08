import sharp from "sharp";
import path from "path";
import fs from "fs";

const inputDir = 'src/images';
const outputDir = '../assets/images';
const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function optimizeImage(inputPath, outputPath) {
  sharp(inputPath)
    .rotate()
    .resize({
      width: 1600,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath)
    .then(() => {
      console.log(`Optimized ${outputPath}`);
    })
    .catch((error) => {
      console.error(`Error optimizing ${outputPath}:`, error);
    });
}

function optimizeImages() {
  fs.readdirSync(inputDir).forEach((file) => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    const extension = path.extname(file).toLowerCase();

    if (extensions.includes(extension)) {
      optimizeImage(inputPath, outputPath);
    }
  });
}

if (process.argv.includes('--watch')) {
  fs.watch(inputDir, { recursive: true }, (eventType, filename) => {
    if (eventType === 'change' || eventType === 'rename') {
      const inputPath = path.join(inputDir, filename);
      const outputPath = path.join(outputDir, filename);
      const extension = path.extname(filename).toLowerCase();

      if (extensions.includes(extension)) {
        optimizeImage(inputPath, outputPath);
      }
    }
  });
} else {
  optimizeImages();
}