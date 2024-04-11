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
    minifyCss: true,
    convertToWebp: true,
    webpQuality: 80,
  },
};
