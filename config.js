export const config = {
  src: {
    images: "src/images",
    js: "src/js",
    sass: "src/scss",
  },
  dist: {
    images: "assets/images",
    js: "assets/js",
    css: "assets/css",
  },
  options: {
    logLevel: "debug",
    convertToWebp: true,
    webpQuality: 80,
    maxWidth: 1920,
    minifyCss: true,
  },
};
