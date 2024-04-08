// src/js/components/smooth-scroll.js
import $ from "jquery";

export function initializeSmoothScroll() {
  $(document).on("click", 'a[href*="#"]', function () {
    const animationDuration = 400;
    const headerHeight = $("header").innerHeight();
    const targetElement = $(this.hash);
    if (!targetElement.length) return;
    const targetPosition = targetElement.offset().top - headerHeight;
    $("html, body").animate({ scrollTop: targetPosition }, animationDuration, "swing");
    return false;
  });
}
