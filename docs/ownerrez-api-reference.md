# OwnerRez REST API (v2) — reference notes

Source: https://api.ownerrez.com/help/v2 (ingested 2026-08-31)

This is the full OwnerRez REST API — separate from the embeddable
`widget.js` booking/search widgets already used on this site (see
[ownerrez-config.js](../js/ownerrez-config.js) and
[ownerrez-widget-css.txt](ownerrez-widget-css.txt)). The widgets need no
credentials and run fine from static HTML. The REST API below requires
account credentials and is **not safe to call directly from client-side
JS** — see Security note at the bottom.

## Overview

- Base URL: `https://api.ownerrez.com`
- Current version: v2 (v1.1 still available, legacy)
- Auth: OAuth 2.0 bearer token, or HTTP Basic auth using account email +
  a Personal Access Token
- List endpoints are "pageable" (`items`, `limit`, `offset`,
  `next_page_url`)

Main resource categories: Bookings, Properties, Guests, Payments &
Refunds, Deposits, Quotes, Messages, Reviews, Fees &
Surcharges/Discounts, Owners, Tags & Fields, ListingSites, Webhooks.

## POST /v2/bookings — create a booking

Request body (`BookingEditModel`), all fields optional unless noted:

| Field | Type | Notes |
|---|---|---|
| `property_id` | integer | property the booking is for |
| `guest_id` | integer | contact ID; required for real bookings, prohibited for blocks |
| `is_block` | boolean | true = blocked-off time, false = guest booking |
| `arrival` | date (yyyy-MM-dd) | in property time zone |
| `departure` | date (yyyy-MM-dd) | in property time zone |
| `check_in` / `check_in_end` | HH:mm | not used for blocks |
| `check_out` | HH:mm | not used for blocks |
| `cleaning_date` | date-time | scheduled cleaning |
| `title` | string | label, mainly for blocks |
| `notes` | string | internal notes |

Response: 200 with a `BookingViewModel` — booking ID, guest, property,
`charges[]`, status, `created_utc`/`updated_utc`/`booked_utc`,
`total_amount`/`total_paid`/`total_owed`, door codes, travel insurance
options, etc.

## GET /v2/bookings — list bookings

Requires either `property_ids` or `since_utc`.

| Param | Type | Notes |
|---|---|---|
| `property_ids` | comma-separated integers | filter to these properties |
| `from` / `to` | date-time | departure-on/after / arrival-on/before, property tz |
| `since_utc` | date-time | created or changed since (UTC) |
| `status` | enum | `active` \| `canceled` \| `pending` |
| `include_door_codes`, `include_charges`, `include_tags`, `include_fields`, `include_guest`, `include_cancellation_policy`, `include_agreements` | boolean | expand extra data in the response |

Response: `PageableEnumerableOfBookingViewModel` (`items`, `limit`,
`offset`, `next_page_url`).

Related: `GET /v2/bookings/{id}`, `PATCH /v2/bookings/{id}`.

## POST /v2/quotes — availability + pricing check (test mode)

This is the endpoint the Home date search will use. `test: true` fully
evaluates the quote (availability + pricing) without saving anything.

Request body, minimum required for a test:
| Field | Type | Notes |
|---|---|---|
| `property_id` | integer | our property's ID |
| `arrival` | date (yyyy-MM-dd) | |
| `departure` | date (yyyy-MM-dd) | |
| `adults` | integer | from our Home "Guests" select |
| `children` | integer | default 0, no field on our Home UI yet |
| `pets` | integer | default 0 |
| `test` | boolean | `true` — evaluate only, don't persist |

Response: a `QuoteViewModel`. If the dates aren't available, the API
returns an error/unavailable status rather than a priced quote (exact
shape to confirm once we have credentials and can make a real call).

## Security note

This site is static HTML/JS with no backend. The Basic Auth /
OAuth credentials this API needs cannot be embedded in client-side code
without exposing them to every visitor. If a direct API integration is
ever wanted (e.g. a custom booking form instead of the OwnerRez widget),
it needs a small server-side proxy (serverless function or backend)
to hold the credentials and call OwnerRez on the client's behalf — the
current widget-based setup avoids that problem entirely by letting
OwnerRez host the authenticated part.
