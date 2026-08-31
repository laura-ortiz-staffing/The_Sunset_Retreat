// Mobile nav toggle
document.addEventListener("DOMContentLoaded", function () {
  var btn = document.querySelector(".nav-toggle");
  var nav = document.querySelector("nav");
  if (!btn || !nav) return;

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    nav.classList.toggle("open");
  });

  // Close when clicking anywhere outside the open menu
  document.addEventListener("click", function (e) {
    if (!nav.classList.contains("open")) return;
    if (nav.contains(e.target) || btn.contains(e.target)) return;
    nav.classList.remove("open");
  });

  // Close on Escape too
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") nav.classList.remove("open");
  });
});
