/*
 * Home page date search — fully our own HTML/CSS, checking real
 * availability via our small backend proxy (see /server), which calls
 * OwnerRez's own API (POST /v2/quotes, test mode) so nothing about
 * availability, pricing, or booking is invented here. On success, we
 * redirect to the Property page with the same ?or_arrival=&or_departure=
 * &or_adults= parameters OwnerRez's own widgets already use to prefill
 * the real Booking/Inquiry widget there.
 */
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("home-search");
  if (!form) return;

  var arrivalEl = document.getElementById("home-arrival");
  var departureEl = document.getElementById("home-departure");
  var guestsEl = document.getElementById("home-guests");
  var btn = document.getElementById("home-search-btn");
  var msg = document.getElementById("home-search-msg");
  var cfg = window.OWNERREZ_CONFIG || {};

  var today = new Date();
  var todayStr = today.toISOString().slice(0, 10);
  arrivalEl.min = todayStr;

  arrivalEl.addEventListener("change", function () {
    if (!arrivalEl.value) return;
    var next = new Date(arrivalEl.value);
    next.setDate(next.getDate() + 1);
    departureEl.min = next.toISOString().slice(0, 10);
    if (departureEl.value && departureEl.value <= arrivalEl.value) {
      departureEl.value = departureEl.min;
    }
  });

  function showMsg(text, isError) {
    msg.textContent = text;
    msg.hidden = false;
    msg.classList.toggle("is-error", !!isError);
  }

  function goToProperty() {
    var params = new URLSearchParams();
    params.set("or_arrival", arrivalEl.value);
    params.set("or_departure", departureEl.value);
    params.set("or_adults", guestsEl.value || "1");
    window.location.href = "property.html?" + params.toString() + "#book";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.hidden = true;

    if (!arrivalEl.value || !departureEl.value) {
      showMsg("Please choose both check-in and check-out dates.", true);
      return;
    }
    if (departureEl.value <= arrivalEl.value) {
      showMsg("Check-out must be after check-in.", true);
      return;
    }

    var apiUrl = cfg.availabilityApiUrl;
    if (!apiUrl || /^REPLACE_WITH/.test(apiUrl)) {
      // Backend not deployed/configured yet — fall back to sending the
      // guest straight to Property with their chosen dates; OwnerRez's
      // own Booking/Inquiry widget there will show real availability.
      goToProperty();
      return;
    }

    btn.disabled = true;
    var originalText = btn.textContent;
    btn.textContent = "Checking...";

    fetch(apiUrl + "/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        arrival: arrivalEl.value,
        departure: departureEl.value,
        adults: guestsEl.value || "1"
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        btn.disabled = false;
        btn.textContent = originalText;
        if (data && data.available) {
          goToProperty();
        } else {
          showMsg((data && data.reason) || "Not available for those dates — try different dates.", true);
        }
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = originalText;
        // Network/server hiccup — don't block the guest, let the real
        // widget on Property be the final word on availability.
        goToProperty();
      });
  });
});
