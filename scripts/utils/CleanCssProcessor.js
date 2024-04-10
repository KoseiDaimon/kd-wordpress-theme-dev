import CleanCSS from "clean-css";

class CleanCssProcessor {
  constructor() {
    // CleanCSSオプションを設定
    this.cleanCSS = new CleanCSS({
      level: {
        1: { specialComments: 0 },
      },
    });
  }

  minifyCSS(css) {
    try {
      // CSSをミニファイ
      const minifiedCss = this.cleanCSS.minify(css);
      return minifiedCss.styles;
    } catch (err) {
      console.error(`[Error] Failed to minify CSS: ${err}`);
      throw err;
    }
  }
}

export default CleanCssProcessor;
