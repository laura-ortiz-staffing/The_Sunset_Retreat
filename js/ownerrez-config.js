/*
 * OwnerRez configuration for Sunset View Retreat.
 * - bookWidgetId: "Booking/Inquiry" widget — the full form (dates,
 *   guests, live quote, Book Now) on the Property/Booking page. Real
 *   OwnerRez widget, unchanged.
 * - availabilityApiUrl: our own small backend (see /server) that holds
 *   OwnerRez API credentials and checks real availability for Home's
 *   own date search UI (js/home-search.js). Not yet deployed —
 *   placeholder until the backend is live on Render.
 *
 * Note: Home no longer uses an OwnerRez widget at all (the old
 * "Availability/Property Search" widget was replaced — its ID isn't
 * needed here anymore). That widget still exists in the OwnerRez
 * account if ever needed again, just unused by this site.
 * ------------------------------------------------------------
 */
window.OWNERREZ_CONFIG = {
  propertyId: "9381c0071c104ea3b40cb4fd6cb3e71f",
  bookWidgetId: "05507e9dd0b54ba3af9b5c4c46bff464",
  widgetScriptSrc: "https://app.ownerrez.com/widget.js",
  availabilityApiUrl: "https://sunset-retreat.onrender.com",
};
