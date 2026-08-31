/*
 * Injects real OwnerRez widgets, using IDs from ownerrez-config.js, then
 * loads OwnerRez's own widget.js once. No custom booking logic here —
 * availability, quoting, and booking/payment all stay on OwnerRez.
 *
 * Two widget types, two jobs:
 *  - data-orez-widget="search"  -> lightweight Availability/Property
 *    Search (Check-in / Check-out + Search button) on the Home hero.
 *    OwnerRez redirects to the property page with
 *    ?or_arrival=...&or_departure=... on submit.
 *  - data-orez-widget="book"    -> full Booking/Inquiry widget on the
 *    Property/Booking page. Reads or_arrival/or_departure/or_adults
 *    from the URL automatically (OwnerRez's own documented behavior —
 *    confirmed by testing directly against the widget).
 *
 * Guests bridge: OwnerRez's Availability/Property Search widget has no
 * guest-count field of its own, so the Home page has our own "Guests"
 * select next to it (plain HTML/CSS, not inside OwnerRez's iframe).
 * We remember that choice in sessionStorage and, on the Property page,
 * add it to the URL as or_adults *before* OwnerRez's widget.js runs —
 * their own script then reads it and prefills their own Adults field.
 * We never touch availability, pricing, or the booking form itself.
 */
(function () {
  var cfg = window.OWNERREZ_CONFIG || {};
  var TYPES = {
    search: { id: cfg.searchWidgetId, label: "Availability/Property Search" },
    book: { id: cfg.bookWidgetId, label: "Booking/Inquiry" }
  };
  var GUESTS_KEY = "svr_guests";

  function notConfiguredMarkup(label) {
    return (
      "<p>OwnerRez " + label + " widget is not configured yet. " +
      "Set the matching widget ID in js/ownerrez-config.js " +
      "(from OwnerRez &rarr; Settings &rarr; Widgets).</p>"
    );
  }

  function wireGuestsSelect() {
    var sel = document.getElementById("home-guests");
    if (!sel) return;
    try {
      var saved = sessionStorage.getItem(GUESTS_KEY);
      if (saved) sel.value = saved;
    } catch (e) {}
    sel.addEventListener("change", function () {
      try {
        if (sel.value) sessionStorage.setItem(GUESTS_KEY, sel.value);
        else sessionStorage.removeItem(GUESTS_KEY);
      } catch (e) {}
    });
  }

  function carryGuestsIntoUrl() {
    if (!document.querySelector('[data-orez-widget="book"]')) return;
    var params = new URLSearchParams(window.location.search);
    if (params.has("or_adults")) return;
    var saved;
    try { saved = sessionStorage.getItem(GUESTS_KEY); } catch (e) { saved = null; }
    if (!saved) return;
    params.set("or_adults", saved);
    var newUrl = window.location.pathname + "?" + params.toString() + window.location.hash;
    window.history.replaceState(null, "", newUrl);
  }

  function build() {
    wireGuestsSelect();
    carryGuestsIntoUrl();

    var slots = document.querySelectorAll("[data-orez-widget]");
    if (!slots.length) return;

    var needsScript = false;
    var missingPropertyId = !cfg.propertyId || /^REPLACE_WITH/.test(cfg.propertyId);

    slots.forEach(function (slot) {
      var kind = slot.getAttribute("data-orez-widget");
      var type = TYPES[kind];
      if (!type) return;

      var widgetId = type.id;
      var missing = missingPropertyId || !widgetId || /^REPLACE_WITH/.test(widgetId);

      if (missing) {
        slot.innerHTML = notConfiguredMarkup(type.label);
        return;
      }

      var div = document.createElement("div");
      div.className = "ownerrez-widget";
      div.setAttribute("data-propertyId", cfg.propertyId);
      div.setAttribute("data-widget-type", type.label);
      div.setAttribute("data-widgetId", widgetId);
      slot.innerHTML = "";
      slot.appendChild(div);
      needsScript = true;
    });

    if (needsScript && !document.querySelector('script[src="' + cfg.widgetScriptSrc + '"]')) {
      var s = document.createElement("script");
      s.src = cfg.widgetScriptSrc;
      s.async = true;
      document.body.appendChild(s);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
