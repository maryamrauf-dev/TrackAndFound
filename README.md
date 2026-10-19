# FoundNearMe

FoundNearMe is a campus lost-and-found web app. Users can browse lost and found listings, search and filter them, view their locations on a map, post an item with an optional photo, and contact the person who posted it through WhatsApp.

## Features currently available

- Browse open lost and found listings in a grid or on a map.
- Search by text and filter by type, category, and date.
- Register, sign in, post listings, and view your activity.
- Add an optional photo and campus location label to a listing.
- Contact the poster of a found item if you recognize it, or contact the owner of a lost item if you found it. Contact is handled through the WhatsApp number supplied with the listing.
- View possible lost/found matches for your own listings.
- Use the admin page to review reports, remove listings, and suspend accounts.
- No AI, automatic ownership verification, or in-app chat is used.

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

Open `http://localhost:5173`. The Vite development server proxies API and image-upload requests to the local API.

Set `VITE_CAMPUS_NAME`, `VITE_CAMPUS_LAT`, and `VITE_CAMPUS_LNG` in `client/.env` to configure the campus name and default map centre.

## Seed accounts

`npm run seed` creates an admin account and a demo student account if they do not already exist. The example environment file and seed script contain development defaults, including predictable demo credentials. **Change the admin password and do not use these defaults for a public deployment.** Seeded accounts are for local development only.

The seed script creates accounts; it does not create sample listings.

## Matching and contact

Possible matches are ranked using keyword overlap, category, location, and date. Matching runs locally in the API and does not use AI or external model services. Contact and handover arrangements take place directly between the person reporting a found item and the listing owner through WhatsApp; no in-app claim review or messaging is provided.

## Deployment notes

The repository does not specify a hosted website URL or production hosting configuration. The Vite proxy is for local development; a deployment must route `/api` and `/uploads` to the API server and configure `CLIENT_URL` for the deployed client origin. Configure production MongoDB and strong secrets, and provide persistent storage for `server/uploads` or replace local uploads with cloud storage.

## Project structure

```text
client/src/
  components/  Listing cards, maps, location picker, navigation
  pages/       Browse, post, item details, activity, admin
server/src/
  models/      Users, items, reports
  routes/      Authentication, items, admin
  services/    Keyword matching, privacy checks
```
