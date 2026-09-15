/*
 * Reviews page. Renders from the curated list in js/reviews-data.js
 * (real reviews copied from Airbnb, since OwnerRez doesn't have them
 * synced yet). Once OwnerRez syncs reviews from Airbnb/Vrbo, this can
 * switch to fetching them live from our /api/reviews backend instead —
 * that endpoint already exists and is ready.
 */
document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("reviews-grid");
  var state = document.getElementById("reviews-state");
  if (!grid) return;

  var reviews = window.FEATURED_REVIEWS || [];
  if (!reviews.length) {
    state.textContent = "No reviews to show yet — check back after our next stays.";
    return;
  }

  function starString(stars) {
    var n = Math.round(Number(stars) || 0);
    return "★".repeat(Math.max(0, Math.min(5, n))) + "☆".repeat(Math.max(0, 5 - n));
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  state.hidden = true;
  grid.innerHTML = reviews.map(function (r) {
    return (
      '<article class="review-card">' +
        '<div class="review-stars" aria-hidden="true">' + starString(r.stars) + '</div>' +
        '<p class="review-body">' + escapeHtml(r.body) + '</p>' +
        '<div class="review-meta">' +
          '<span class="review-author">' + escapeHtml(r.name) + '</span>' +
          (r.location ? '<span class="review-location">' + escapeHtml(r.location) + '</span>' : '') +
          '<span class="review-stay">' + escapeHtml(r.stay) + ' &middot; ' + escapeHtml(r.source) + '</span>' +
        '</div>' +
      '</article>'
    );
  }).join("");
});
