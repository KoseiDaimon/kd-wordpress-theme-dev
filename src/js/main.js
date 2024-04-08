// main.js
import $ from "jquery";

const scrollToTopButton = $(".js-scrollToTop");
scrollToTopButton.on("click", () => {
  import("./components/scroll-to-top.js").then((module) => {
    module.init(scrollToTopButton);
  });
});
