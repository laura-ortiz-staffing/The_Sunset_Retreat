# Availability proxy — deploy notes

This is a **separate service** from the main static site. It exists only
to hold OwnerRez API credentials server-side and answer one question for
the Home page: "is this property available for these dates?"

## Deploy on Render
1. Render → New → **Web Service** (not Static Site).
2. Connect the same GitHub repo, set **Root Directory** to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables (Settings → Environment): `OWNERREZ_API_EMAIL`,
   `OWNERREZ_API_TOKEN`, `OWNERREZ_PROPERTY_ID`, `ALLOWED_ORIGIN` (the
   static site's URL).
6. Deploy — Render gives a URL like `https://svr-availability.onrender.com`.
7. Put that URL into the frontend's availability-check config (once the
   Home date search is wired to call it — not done yet).

## Test locally
```
cd server
cp .env.example .env   # fill in real values
npm install
npm start
curl http://localhost:3000/health
```

## Test the availability check
```
curl -X POST http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -d '{"arrival":"2026-10-10","departure":"2026-10-13","adults":4}'
```
