# Plan: Airbnb + PriceLabs integration (dashboard config, not code)

**Status:** Not started. This is entirely account configuration in OwnerRez
and PriceLabs — the website's codebase has no role in this and needs no
changes. Credentials for both already exist per the client checklist.

## Why (ties to the approved architecture)
PriceLabs (dynamic pricing) → OwnerRez (single source of truth, "Spot
Rates") → two outputs:
- **Direct website**: raw OwnerRez rate, no markup.
- **Airbnb**: OwnerRez rate + 15% (client-confirmed markup), pushed
  through OwnerRez's own Airbnb channel connection.

PriceLabs never talks to Airbnb directly — only to OwnerRez. This keeps
one source of truth and avoids manually re-entering prices in two
places or them drifting out of sync.

## Step 1 — Connect Airbnb inside OwnerRez
OwnerRez → Settings → **Channel Management → Channel Integrations**
1. Connect the Airbnb account (login: `john@jlapp.net` — 2FA required,
   message John first per his own note in the credentials checklist).
2. Map the existing Airbnb listing (listing ID `48090630`,
   `airbnb.com/hosting/listings/editor/48090630`) to the Sunset View
   Retreat property record in OwnerRez.
3. Set the **channel markup** to +15% for Airbnb (this is the field
   that makes Airbnb show a higher rate than direct, automatically,
   from the same base OwnerRez rate).
4. Confirm **booking mode** — Instant Book vs. Request-to-Book. This
   was flagged as an open question in the Developer Brief; needs a
   decision before going live.
5. Confirm the calendar syncs both ways once connected (an Airbnb
   booking blocks the date in OwnerRez, and vice versa) — this is
   default behavior for a proper channel connection, not iCal, so
   double-bookings shouldn't be possible once set up correctly.

## Step 2 — Connect PriceLabs to OwnerRez
PriceLabs → Integrations → OwnerRez (PriceLabs has a native OwnerRez
integration; OwnerRez's own "Connected Apps" / "OAuth Apps" section
under Developer/API Settings is the other half of that handshake).
1. Authorize the connection (PriceLabs login: `john@jlapp.net`).
2. Import/select the Sunset View Retreat property in PriceLabs.
3. Set PriceLabs' pricing rules (min/max nightly rate, seasonality,
   comps) — this is a revenue-management decision for the
   client/property manager, not something to hardcode anywhere.
4. Confirm PriceLabs is set to push rates to OwnerRez as **Spot
   Rates** (not overwrite base rates directly) and check the sync
   frequency (typically daily).

## Step 3 — Verify end to end
1. Change a rate in PriceLabs → confirm it appears as a Spot Rate on
   that date in OwnerRez's calendar.
2. Check the live website (Property page widget / Home's own
   availability check) shows that same direct rate — it will
   automatically, since both read live from OwnerRez.
3. Check the Airbnb listing shows that rate +15% after OwnerRez syncs
   to the channel.

## What the website does NOT need
No code changes anywhere on this site for any of the above — pricing,
channel markup, and Airbnb sync all live in OwnerRez/PriceLabs
configuration. The site only ever displays whatever OwnerRez currently
has as the rate, through the existing Booking/Inquiry widget and the
Home availability API.
