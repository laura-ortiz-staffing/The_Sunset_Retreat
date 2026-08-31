// Carousel arrows + lightbox for the photo gallery. Plain vanilla JS,
// no external library — CSS-drawn arrows (not icon-font glyphs) so
// nothing depends on a webfont loading correctly.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".carousel").forEach(function (car) {
    var track = car.querySelector(".carousel-track");
    var prev = car.querySelector(".car-btn.prev");
    var next = car.querySelector(".car-btn.next");
    if (!track) return;
    function step() {
      var img = track.querySelector("img");
      return img ? img.getBoundingClientRect().width + 12 : 260;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  });

  var imgs = Array.prototype.slice.call(document.querySelectorAll(".carousel-track img"));
  var lb = document.getElementById("lightbox");
  if (!imgs.length || !lb) return;

  var lbImg = document.getElementById("lightbox-img");
  var idx = 0;

  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    lbImg.src = imgs[idx].src;
    lbImg.alt = imgs[idx].alt;
  }
  function open(i) { show(i); lb.hidden = false; }
  function close() { lb.hidden = true; }

  imgs.forEach(function (img, i) {
    img.style.cursor = "pointer";
    img.addEventListener("click", function () { open(i); });
  });
  document.getElementById("lightbox-close").addEventListener("click", close);
  document.getElementById("lightbox-prev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("lightbox-next").addEventListener("click", function () { show(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
});
