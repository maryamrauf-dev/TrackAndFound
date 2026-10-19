# FoundNearMe

FoundNearMe is a campus lost-and-found web app. Users can browse lost and found listings, search and filter them, view their locations on a map, post an item with an optional photo, and contact the other person through WhatsApp.

## Features currently available

- Browse open lost and found listings in a grid or on a map.
- Search by text and filter by type, category, and date.
- Register, sign in, post listings, and view your activity.
- Add an optional photo and campus location label to a listing.
- Contact the finder or owner directly through the WhatsApp number supplied with a listing.
- View possible lost/found matches for your own listings.
- Use the admin page to review reports, remove listings, and suspend accounts.

**Claim verification is not connected to the current item-page UI.** The server contains claim-question and chat APIs, but clicking “This is mine” currently opens WhatsApp directly. Do not rely on the question-based verification or in-app chat flow being active in the website.

## Run locally

Requirements: Node.js 18 or newer and a running MongoDB instance.

### 1. Start the API

```powershell
cd server
Copy-Item .env.example .env
npm install
npm run seed
npm run dev
```

The API listens on `http://localhost:5000`. Before using it, edit `server/.env` and set a private `JWT_SECRET`, a working `MONGO_URI`, and (if needed) the admin email and password.

### 2. Start the web app

In a second terminal:

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies API, upload, and Socket.IO requests to the local API.

Set `VITE_CAMPUS_NAME`, `VITE_CAMPUS_LAT`, and `VITE_CAMPUS_LNG` in `client/.env` to configure the campus name and default map centre.

## Seed accounts

`npm run seed` creates an admin account and a demo student account if they do not already exist. The example environment file and seed script contain development defaults, including predictable demo credentials. **Change the admin password and do not use these defaults for a public deployment.** Seeded accounts are for local development only.

The seed script creates accounts; it does not create sample listings.

## Optional AI features

Set `OPENAI_API_KEY` in `server/.env` to enable photo tagging and embeddings. Without a key, matching uses keyword overlap. The server also contains keyword-based fallback claim grading, but claim verification is not currently connected to the website's item-page flow.

The optional model settings are `OPENAI_CHAT_MODEL` and `OPENAI_EMBED_MODEL`. Claim API thresholds can be set with `APPROVE_AT`, `REVIEW_AT`, and `MAX_ATTEMPTS`.

## Deployment notes

The repository does not specify a hosted website URL or production hosting configuration. The Vite proxy is for local development; a deployment must route `/api`, `/uploads`, and `/socket.io` to the API server and configure `CLIENT_URL` for the deployed client origin. Configure production MongoDB and strong secrets, and provide persistent storage for `server/uploads` or replace local uploads with cloud storage.

## Project structure

```text
client/src/
  components/  Listing cards, maps, location picker, navigation
  pages/       Browse, post, item details, activity, admin, chat
server/src/
  models/      Users, items, claims, messages, reports
  routes/      Authentication, items, claims, admin
  services/    AI helpers, matching, privacy checks
  socket.js    Authenticated Socket.IO chat
```
