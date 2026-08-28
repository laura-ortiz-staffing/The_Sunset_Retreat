/*
 * OwnerRez widget configuration for Sunset View Retreat.
 * - searchWidgetId: "Availability/Property Search" widget — lightweight
 *   Check-in/Check-out/Guests bar on the Home hero. Create it in
 *   OwnerRez -> Settings -> Widgets -> Create Widget ->
 *   "Availability/Property Search (Multi Property)" (works fine with
 *   a single property). Set its redirect/"link to" target to
 *   property.html so dates carry over via ?or_arrival=&or_departure=.
 * - bookWidgetId: "Booking/Inquiry" widget — full form on the
 *   Property/Booking page. Already configured below.
 * ------------------------------------------------------------
 */
window.OWNERREZ_CONFIG = {
  propertyId: "9381c0071c104ea3b40cb4fd6cb3e71f",
  searchWidgetId: "d38f4dedd39d4cfeba95d2c20e33f28e",
  bookWidgetId: "05507e9dd0b54ba3af9b5c4c46bff464",
  widgetScriptSrc: "https://app.ownerrez.com/widget.js",
};
