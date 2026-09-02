/*
 * Home page date + guest search — fully our own HTML/CSS, checking real
 * availability via our small backend proxy (see /server), which calls
 * OwnerRez's own API (POST /v2/quotes, test mode) so nothing about
 * availability, pricing, or booking is invented here. On success, we
 * redirect to the Property page with ?or_arrival=&or_departure=&or_adults=
 * &or_children=&or_pets= — the same parameter names OwnerRez's own
 * widgets use to prefill the real Booking/Inquiry widget there
 * (confirmed by testing directly against the widget).
 */
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("home-search");
  if (!form) return;

  var arrivalEl = document.getElementById("home-arrival");
  var departureEl = document.getElementById("home-departure");
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

  // --- Guest picker (Adults / Children / Pets) ---
  var picker = document.getElementById("guest-picker");
  var pickerBtn = document.getElementById("guest-picker-btn");
  var pickerPanel = document.getElementById("guest-picker-panel");
  var counts = { adults: 1, children: 0, pets: 0 };
  var limits = { adults: { min: 1, max: 16 }, children: { min: 0, max: 10 }, pets: { min: 0, max: 2 } };

  function updateStepUI() {
    Object.keys(counts).forEach(function (key) {
      var el = document.getElementById(key + "-count");
      if (el) el.textContent = counts[key];
      document.querySelectorAll('.step-btn[data-target="' + key + '"]').forEach(function (b) {
        var delta = parseInt(b.getAttribute("data-delta"), 10);
        var limit = limits[key];
        b.disabled = delta < 0 ? counts[key] <= limit.min : counts[key] >= limit.max;
      });
    });
  }

  function updatePickerSummary() {
    var totalGuests = counts.adults + counts.children;
    var parts = [totalGuests + (totalGuests === 1 ? " guest" : " guests")];
    if (counts.pets > 0) parts.push(counts.pets + (counts.pets === 1 ? " pet" : " pets"));
    pickerBtn.textContent = parts.join(", ");
  }

  if (picker && pickerBtn && pickerPanel) {
    document.querySelectorAll(".step-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-target");
        var delta = parseInt(b.getAttribute("data-delta"), 10);
        var limit = limits[key];
        var next = counts[key] + delta;
        if (next < limit.min || next > limit.max) return;
        counts[key] = next;
        updateStepUI();
        updatePickerSummary();
      });
    });

    pickerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = pickerPanel.hidden;
      pickerPanel.hidden = !open;
      pickerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    var doneBtn = document.getElementById("guest-picker-done");
    if (doneBtn) doneBtn.addEventListener("click", function () { closePicker(); });

    function closePicker() {
      pickerPanel.hidden = true;
      pickerBtn.setAttribute("aria-expanded", "false");
    }

    document.addEventListener("click", function (e) {
      if (!picker.contains(e.target)) closePicker();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePicker();
    });

    updateStepUI();
    updatePickerSummary();
  }

  function showMsg(text, isError) {
    msg.textContent = text;
    msg.hidden = false;
    msg.classList.toggle("is-error", !!isError);
  }

  function goToProperty() {
    var params = new URLSearchParams();
    params.set("or_arrival", arrivalEl.value);
    params.set("or_departure", departureEl.value);
    params.set("or_adults", counts.adults);
    params.set("or_children", counts.children);
    params.set("or_pets", counts.pets);
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
        adults: counts.adults,
        children: counts.children,
        pets: counts.pets
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        btn.disabled = false;
        btn.textContent = originalText;
        if (data && data.available === false) {
          // A real business answer from OwnerRez: genuinely not available.
          showMsg(data.reason || "Not available for those dates — try different dates.", true);
        } else {
          // available:true, or available:null (a technical hiccup on
          // OwnerRez's side) — don't block the guest either way; the
          // real Booking/Inquiry widget on Property is the final word.
          goToProperty();
        }
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = originalText;
        goToProperty();
      });
  });
});
