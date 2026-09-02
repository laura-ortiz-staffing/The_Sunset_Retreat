/*
 * Sunset View Retreat — availability proxy.
 *
 * Holds the OwnerRez API credentials (never sent to the browser) and
 * proxies a single job: "is this property available for these dates,
 * for this many guests?" using OwnerRez's own POST /v2/quotes endpoint
 * in test mode (test: true — evaluates availability + pricing without
 * creating a real quote/booking).
 *
 * This does NOT calculate pricing, taxes, fees, or handle payment —
 * OwnerRez's own numbers are relayed as-is, and the actual booking
 * still happens on OwnerRez's native Booking/Inquiry widget on the
 * Property page. This service only unblocks styling the Home date
 * search ourselves instead of fighting OwnerRez's widget CSS field.
 *
 * Required environment variables (set these in Render, never commit
 * them to the repo):
 *   OWNERREZ_API_EMAIL     - the OwnerRez account email for API auth
 *   OWNERREZ_API_TOKEN     - Personal Access Token from OwnerRez
 *   OWNERREZ_PROPERTY_ID   - this property's OwnerRez property ID
 *   ALLOWED_ORIGIN         - the site's origin, e.g.
 *                            https://the-sunset-retreat.onrender.com
 *                            (restricts who can call this API)
 */
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: ALLOWED_ORIGIN }));

const OWNERREZ_API_BASE = "https://api.ownerrez.com";

function missingEnv() {
  var missing = [];
  if (!process.env.OWNERREZ_API_EMAIL) missing.push("OWNERREZ_API_EMAIL");
  if (!process.env.OWNERREZ_API_TOKEN) missing.push("OWNERREZ_API_TOKEN");
  if (!process.env.OWNERREZ_PROPERTY_ID) missing.push("OWNERREZ_PROPERTY_ID");
  return missing;
}

app.get("/health", function (req, res) {
  var missing = missingEnv();
  res.json({ ok: missing.length === 0, missingEnv: missing });
});

app.post("/api/availability", async function (req, res) {
  var missing = missingEnv();
  if (missing.length) {
    return res.status(500).json({ error: "Server not configured", missingEnv: missing });
  }

  var body = req.body || {};
  var arrival = body.arrival;
  var departure = body.departure;
  var adults = parseInt(body.adults, 10) || 1;

  if (!arrival || !departure) {
    return res.status(400).json({ error: "arrival and departure (YYYY-MM-DD) are required" });
  }

  var auth = Buffer.from(
    process.env.OWNERREZ_API_EMAIL + ":" + process.env.OWNERREZ_API_TOKEN
  ).toString("base64");

  var payload = JSON.stringify({
    property_id: parseInt(process.env.OWNERREZ_PROPERTY_ID, 10),
    arrival: arrival,
    departure: departure,
    adults: adults,
    children: parseInt(body.children, 10) || 0,
    pets: parseInt(body.pets, 10) || 0,
    test: true
  });

  async function callQuote() {
    var orRes = await fetch(OWNERREZ_API_BASE + "/v2/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + auth
      },
      body: payload
    });
    var data = await orRes.json().catch(function () { return null; });
    return { status: orRes.status, ok: orRes.ok, data: data };
  }

  try {
    var result = await callQuote();

    // A clean 5xx, or a non-JSON body, means OwnerRez itself had a
    // problem — not that the dates are unavailable. Retry once before
    // giving up, since this has been observed to be transient.
    if (!result.ok && (result.status >= 500 || result.data === null)) {
      console.error("OwnerRez /v2/quotes transient failure, retrying:", result.status);
      await new Promise(function (r) { setTimeout(r, 800); });
      result = await callQuote();
    }

    if (!result.ok && (result.status >= 500 || result.data === null)) {
      // Still failing after a retry — a real OwnerRez-side hiccup.
      // Don't tell the guest "not available" for something that isn't
      // actually a business answer; let the real Booking/Inquiry
      // widget on the Property page be the final word instead.
      console.error("OwnerRez /v2/quotes still failing after retry:", result.status, JSON.stringify(result.data));
      return res.status(200).json({
        available: null,
        reason: "Could not check availability right now."
      });
    }

    if (!result.ok) {
      // A clean, parseable 4xx — a real business answer (not available,
      // min-stay not met, etc.)
      return res.status(200).json({
        available: false,
        reason: (result.data && (result.data.message || result.data.error)) || "Not available for these dates.",
        status: result.status
      });
    }

    return res.status(200).json({
      available: true,
      quote: result.data
    });
  } catch (err) {
    console.error("OwnerRez API call failed:", err);
    return res.status(200).json({ available: null, reason: "Could not check availability right now." });
  }
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Availability proxy listening on port " + PORT);
});
