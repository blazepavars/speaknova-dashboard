# Speak Nova Internal Dashboard

Secure internal dashboard for documents and notices with admin management.

## Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)

## Branding
- Background: `#09171a`
- Text: `#e9eff5`
- Primary: `#8888f2`
- Pink: `#F0CCEF`
- Lime: `#E1F274`

## Getting Started
1. Copy `.env.local.example` to `.env.local` and fill Firebase values.
2. Install deps: `npm i`
3. Dev server: `npm run dev`

## Firebase Setup
1. Create a Firebase project.
2. Enable Authentication (Email/Password).
3. Create Firestore (production or test mode).
4. Create Storage bucket.
5. Download a Service Account JSON.
   - Either paste into `FIREBASE_SERVICE_ACCOUNT` as a single-line JSON string
   - Or set `FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/service-account.json`

### Security Rules
- Apply `firebase.firestore.rules` to Firestore.
- Apply `firebase.storage.rules` to Storage.

### Indexes
- Import `firestore.indexes.json` in Firestore Indexes.

## Roles
- `viewer`: read-only access to docs/notices.
- `admin`: full access and user management.

Admin APIs (server routes) require `FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_SERVICE_ACCOUNT_PATH` and set custom claims for roles.

## Scripts
- `npm run dev` – starts dev server
- `npm run build` – builds for production
- `npm start` – runs production server
