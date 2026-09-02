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

  try {
    var orRes = await fetch(OWNERREZ_API_BASE + "/v2/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + auth
      },
      body: JSON.stringify({
        property_id: parseInt(process.env.OWNERREZ_PROPERTY_ID, 10),
        arrival: arrival,
        departure: departure,
        adults: adults,
        children: parseInt(body.children, 10) || 0,
        pets: parseInt(body.pets, 10) || 0,
        test: true
      })
    });

    var data = await orRes.json().catch(function () { return null; });

    if (!orRes.ok) {
      // OwnerRez returns an error/4xx for unavailable dates or bad input —
      // relay a simple available:false rather than a raw 500 for the
      // common "not available" case.
      return res.status(200).json({
        available: false,
        reason: (data && (data.message || data.error)) || "Not available for these dates.",
        status: orRes.status
      });
    }

    return res.status(200).json({
      available: true,
      quote: data
    });
  } catch (err) {
    console.error("OwnerRez API call failed:", err);
    return res.status(502).json({ error: "Could not reach OwnerRez API" });
  }
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Availability proxy listening on port " + PORT);
});
