export const config = {
  server: {
    url: "http://localhost:8001",
  },
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
    convertToWebp: false,
    imageQuality: 80,
    maxWidth: 1920,
    minifyJs: false,
    minifyCss: false,
    logLevel: "debug",
  },
};
