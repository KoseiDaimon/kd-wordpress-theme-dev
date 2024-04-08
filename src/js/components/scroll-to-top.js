// src/js/components/scroll-to-top.js
import $ from "jquery";

export function init(scrollToTopButton) {
  scrollToTopButton.hide();

  $(window).scroll(function () {
    const scrollPosition = $(this).scrollTop();
    const showButtonThreshold = 70;
    if (scrollPosition > showButtonThreshold) {
      scrollToTopButton.fadeIn();
    } else {
      scrollToTopButton.fadeOut();
    }
  });

  scrollToTopButton.click(function () {
    const animationDuration = 300;
    const animationEasing = "swing";
    $("body, html").animate({ scrollTop: 0 }, animationDuration, animationEasing);
    return false;
  });
}
