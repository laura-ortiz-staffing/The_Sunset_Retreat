# Plan: Home date search via OwnerRez API

**Status:** Approved and in progress.
- Done: frontend (`index.html`, `js/home-search.js`, CSS) — Home's own
  date/guests search UI, replacing the OwnerRez widget there.
- Done: backend scaffolding (`/server`) — Express proxy for
  `POST /v2/quotes` (test mode), tested locally, returns the expected
  "not configured" response with no credentials set.
- **Blocked on:** real OwnerRez API credentials (email + Personal Access
  Token) and the property's OwnerRez property ID, to actually call the
  live API and deploy the backend on Render.
- Not pushed to GitHub/Render yet per instruction — local only until
  told to commit.

## Why
The native OwnerRez "Availability/Property Search" widget on Home is embedded via a
cross-origin iframe. Its only customization surface is the per-widget "CSS" field in
the OwnerRez dashboard, which we found to be unreliable for this use case:

- The field silently truncates CSS past a certain character count (confirmed:
  a ~2700-character stylesheet was cut off mid-file with no error; a ~1750-character
  version saved in full).
- Even within the length limit, some layout-critical properties did not visibly
  apply in testing (`display`), requiring a fallback to `float`-based layout.
- No control over markup structure, no guest-count field on this widget type at all
  (confirmed by fetching the widget's real HTML directly).

This is a genuine, documented blocker per the project's own escalation rule
("only consider a custom API implementation if something required by the existing
design genuinely cannot be accomplished with OwnerRez's native components, and
identify the exact blocker before switching approaches").

## Proposed approach
- **Home page:** replace the embedded OwnerRez widget with our own HTML/CSS date
  search UI (full styling control), calling OwnerRez's real API to check
  availability for the selected dates before redirecting to `property.html` with
  `?or_arrival=&or_departure=` (same params the current widget already uses, so the
  Booking/Inquiry widget on Property keeps prefilling exactly as it does now).
- **Property page:** unchanged — keeps the native OwnerRez "Booking/Inquiry" widget
  for the full form, live quote, and payment. This plan does not touch that.
- No pricing, payment, or booking logic gets built ourselves — the API call is
  read-only (availability check) to gate what dates our own calendar UI allows the
  guest to pick; OwnerRez remains the source of truth for the actual booking.

## What's needed before starting
1. **OwnerRez API credentials** — an API key and secret from the client's OwnerRez
   account (Settings → API, or wherever OwnerRez exposes app/API credentials for
   their REST API). These must never be exposed in client-side JS.
2. **A small backend/serverless endpoint** to hold that secret and proxy the
   availability check — the static site alone (current Render Static Site) can't
   do this securely. Render supports a lightweight Web Service for this alongside
   the existing static site; this is a new piece of infrastructure, not just more
   frontend code.
3. Confirmation this is worth the added infrastructure/maintenance versus continuing
   to refine the native widget's CSS.

## Scope boundaries (carried over from the project brief)
- Do not build a custom booking engine — this only covers the availability *check*
  behind the date picker, not quotes, pricing, or payment.
- OwnerRez remains the single source of truth for availability, pricing, and
  bookings.
