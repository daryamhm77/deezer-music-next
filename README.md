# SeaMusicPlayer

A Next.js music web app with Deezer catalog previews, personal library, and taste-based home recommendations.

## Features

- **Auth** — email/password and Google OAuth via [better-auth](https://www.better-auth.com/)
- **Onboarding** — pick at least 10 artists; auto-creates playlists and favorites
- **Home**
  - Guests: top songs, genres, and singers
  - Logged-in: made-for-you playlists, recommended songs/singers, genres from your taste
- **Search** — songs and singers from the navbar
- **Library** — favorite songs, favorite artists, custom playlists
- **Player** — preview playback, queue, lyrics (LRCLIB)

> Audio comes from Deezer’s public API (**~30s previews**). Full-track streaming and downloads are not available.

## Stack

| Area | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Data | TanStack Query, Zod |
| Auth | better-auth |
| Database | MongoDB 7 (Docker Compose) |
| Music | Deezer public API |

## Prerequisites

- Node.js 20+
- npm
- Docker (for MongoDB)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start MongoDB

```bash
npm run db:up
```

Mongo is exposed on **host port `27018`** (mapped to container `27017`).

### 3. Environment

Create `.env.local` in the project root:

```env
BETTER_AUTH_SECRET=generate-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000

MONGODB_URI=mongodb://127.0.0.1:27018
MONGODB_DB_NAME=sea-music-player

GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

**Google OAuth:** in Google Cloud Console, set the authorized redirect URI to:

```text
http://localhost:3000/api/auth/callback/google
```

No Deezer API key is required for the public catalog endpoints used here.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run db:up` | Start MongoDB container |
| `npm run db:down` | Stop MongoDB container |

## Project structure

```text
src/
  app/                 # Next.js routes (auth, main, onboarding, API)
  components/          # Shared UI (navbar, sidebar, player, …)
  connections/         # Deezer + Mongo repositories
  contracts/           # Zod schemas / shared types
  features/            # Feature modules (home, auth, library, search, …)
  layouts/             # App chrome layouts
  messages/en/         # UI copy
  providers/           # React Query, player state
  routes/paths.ts      # Central route paths
```

Pages stay thin; business UI and data hooks live under `src/features/`.

## Main routes

| Path | Description |
| --- | --- |
| `/` | Home (guest explore or personalized) |
| `/login`, `/signup` | Auth |
| `/onboarding` | Artist picks (required after signup) |
| `/search` | Search results |
| `/playlists`, `/playlists/[id]` | Playlists |
| `/favorites/songs` | Favorite songs |
| `/favorites/artists` | Favorite singers |

## Performance / security

| Item | Where |
| --- | --- |
| Streaming guest home | `(public)/page.tsx` + `guest-home-sections.tsx` (Suspense per section) |
| `loading.tsx` / `error.tsx` | `(public)`, `(private)`, `(auth)`, `(onboarding)`, `search` |
| Image `sizes` + blur | `lib/image.ts`, guest grids, song cards |
| Prefetch | Navbar home links + `router.prefetch('/search')` |
| Light auth | `(auth)/layout` — no player/query chrome |
| Session no-store | `lib/http.privateJson` on library/onboarding/recommendations |
| Deezer rate limit | `lib/rate-limit.ts` on `/api/deezer/*` (429 + Retry-After) |
