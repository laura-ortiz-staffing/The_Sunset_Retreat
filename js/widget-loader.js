/*
 * Injects the real OwnerRez "Booking/Inquiry" widget into any element
 * with data-orez-widget="book" (used on the Home hero and the
 * Property/Booking page), using the IDs from ownerrez-config.js, then
 * loads OwnerRez's own widget.js once. This keeps availability,
 * quoting and booking/payment entirely on OwnerRez's side — no
 * custom booking logic is implemented here.
 */
(function () {
  var cfg = window.OWNERREZ_CONFIG || {};
  var WIDGET_TYPE = "Booking/Inquiry";

  function notConfiguredMarkup() {
    return (
      "<p>OwnerRez Booking/Inquiry widget is not configured yet. " +
      "Set propertyId and bookWidgetId in js/ownerrez-config.js " +
      "(from OwnerRez &rarr; Settings &rarr; Widgets).</p>"
    );
  }

  function build() {
    var slots = document.querySelectorAll('[data-orez-widget="book"]');
    if (!slots.length) return;

    var missing =
      !cfg.propertyId || !cfg.bookWidgetId ||
      /^REPLACE_WITH/.test(cfg.propertyId) || /^REPLACE_WITH/.test(cfg.bookWidgetId);

    slots.forEach(function (slot) {
      if (missing) {
        slot.innerHTML = notConfiguredMarkup();
        return;
      }
      var div = document.createElement("div");
      div.className = "ownerrez-widget";
      div.setAttribute("data-propertyId", cfg.propertyId);
      div.setAttribute("data-widget-type", WIDGET_TYPE);
      div.setAttribute("data-widgetId", cfg.bookWidgetId);
      slot.innerHTML = "";
      slot.appendChild(div);
    });

    if (!missing && !document.querySelector('script[src="' + cfg.widgetScriptSrc + '"]')) {
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
