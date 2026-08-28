# Sunset View Retreat — website

Plain HTML/CSS/JS, no build step, no dependencies. OwnerRez handles all
availability, quoting, guest count, pricing, fees/taxes, and payment —
this site only embeds OwnerRez's own widgets.

## Structure
- `index.html` — Home (hero + availability search widget)
- `property.html` — Gallery, amenities, live quote/Book Now widget
- `the-area.html`, `faq.html`, `policies.html` — content pages
- `css/style.css` — shared styles (palette in `:root`, easy to swap)
- `js/ownerrez-config.js` — **fill in your OwnerRez IDs here**
- `js/widget-loader.js` — injects the OwnerRez widget markup + loads `widget.js`
- `img/` — resized property photos (originals were 20–37MB; these are ~1920px/~1MB)

## Setup status
Done: one OwnerRez **Booking/Inquiry** widget was created (handles date
selection, live availability, quote, and Book Now in a single widget) and
its IDs are already set in `js/ownerrez-config.js`. It's embedded on both
the Home hero and the Property/Booking page.

## Remaining (OwnerRez dashboard — cannot be done from code)
1. Confirm rates/taxes/extra-guest fee, the 50% booking / 50% due 7 days
   before arrival schedule, and the $300 deposit hold are set in OwnerRez
   (not in this code).
2. Connect the custom domain + HTTPS once purchased.
3. Deploy these files to any static host pointed at that domain (no server
   required).

If the widget IDs in `js/ownerrez-config.js` are ever missing/wrong, the
booking card shows a visible "not configured yet" placeholder instead of
failing silently.

## Notes
- No client color palette existed in the provided files (client confirmed
  "no logo/color preference — keep it clean and simple"); `css/style.css`
  uses a minimal neutral palette with one warm accent, easily changed via
  the CSS variables at the top of the file.
- Vrbo is intentionally not referenced anywhere in this site.
