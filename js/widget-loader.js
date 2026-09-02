/*
 * Injects the real OwnerRez "Booking/Inquiry" widget on the
 * Property/Booking page, using the ID from ownerrez-config.js, then
 * loads OwnerRez's own widget.js. No custom booking logic here —
 * availability, quoting, and booking/payment all stay on OwnerRez.
 *
 * It reads or_arrival/or_departure/or_adults from the current page's
 * URL automatically (OwnerRez's own documented behavior, confirmed by
 * testing directly against the widget) — those params are set by
 * js/home-search.js when it sends a guest here from the Home page.
 *
 * Note: the Home page no longer uses an OwnerRez widget at all — its
 * date search is our own UI (see js/home-search.js) calling our own
 * availability API (see /server), so this loader only has one job now.
 */
(function () {
  var cfg = window.OWNERREZ_CONFIG || {};

  function notConfiguredMarkup() {
    return (
      "<p>OwnerRez Booking/Inquiry widget is not configured yet. " +
      "Set bookWidgetId in js/ownerrez-config.js " +
      "(from OwnerRez &rarr; Settings &rarr; Widgets).</p>"
    );
  }

  function build() {
    var slot = document.querySelector('[data-orez-widget="book"]');
    if (!slot) return;

    var missing =
      !cfg.propertyId || !cfg.bookWidgetId ||
      /^REPLACE_WITH/.test(cfg.propertyId) || /^REPLACE_WITH/.test(cfg.bookWidgetId);

    if (missing) {
      slot.innerHTML = notConfiguredMarkup();
      return;
    }

    var div = document.createElement("div");
    div.className = "ownerrez-widget";
    div.setAttribute("data-propertyId", cfg.propertyId);
    div.setAttribute("data-widget-type", "Booking/Inquiry");
    div.setAttribute("data-widgetId", cfg.bookWidgetId);
    slot.innerHTML = "";
    slot.appendChild(div);

    if (!document.querySelector('script[src="' + cfg.widgetScriptSrc + '"]')) {
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
