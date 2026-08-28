/*
 * Injects real OwnerRez widgets, using IDs from ownerrez-config.js, then
 * loads OwnerRez's own widget.js once. No custom booking logic here —
 * availability, quoting, and booking/payment all stay on OwnerRez.
 *
 * Two widget types, two jobs:
 *  - data-orez-widget="search"  -> lightweight Availability/Property
 *    Search (Check-in / Check-out / Guests + Search button) on the
 *    Home hero. OwnerRez redirects to the property page with
 *    ?or_arrival=...&or_departure=... on submit.
 *  - data-orez-widget="book"    -> full Booking/Inquiry widget on the
 *    Property/Booking page. Reads those same or_arrival/or_departure
 *    params from the URL automatically (OwnerRez's own behavior).
 */
(function () {
  var cfg = window.OWNERREZ_CONFIG || {};
  var TYPES = {
    search: { id: cfg.searchWidgetId, label: "Availability/Property Search" },
    book: { id: cfg.bookWidgetId, label: "Booking/Inquiry" }
  };

  function notConfiguredMarkup(label) {
    return (
      "<p>OwnerRez " + label + " widget is not configured yet. " +
      "Set the matching widget ID in js/ownerrez-config.js " +
      "(from OwnerRez &rarr; Settings &rarr; Widgets).</p>"
    );
  }

  function build() {
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
