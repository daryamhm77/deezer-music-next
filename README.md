# SeaMusicPlayer

A Next.js music discovery app: browse Deezer’s public catalog, save favorites and playlists, and get a home feed shaped by the artists you pick.

Guests can explore and search. Accounts unlock onboarding, a personal library, and taste-based recommendations. Playback uses Deezer **~30s previews** (not full tracks).

---

## What it does

| Who | Experience |
| --- | --- |
| **Guest** | Home shows top songs, genres, and singers (streamed from the server). Search works from the navbar. Play previews; no private library. |
| **New user** | Sign up (email/password or Google) → pick **at least 10 artists** → the app seeds favorite artists, favorite songs, and starter playlists from those picks. |
| **Signed-in** | Home becomes personalized (recommended songs/artists, genres from taste, your playlists). Library: favorites + custom playlists. Player queue + lyrics. |

**Not included:** full-track streaming, downloads, or a Deezer API key. Catalog calls use Deezer’s public endpoints; lyrics come from [LRCLIB](https://lrclib.net/).

---

## Features

- **Auth** — email/password + optional Google OAuth ([better-auth](https://www.better-auth.com/))
- **Onboarding** — artist picks (≥10); auto-creates favorites and playlists
- **Home**
  - Guests: explore charts (SSR + Suspense streaming)
  - Users: made-for-you recommendations (CSR, session-bound)
- **Search** — songs and singers; SSR first paint, then client refinements
- **Library** — favorite songs, favorite artists, create/edit playlists
- **Player** — preview playback, queue, lyrics modal
- **SEO** — metadata, canonical/OG, `sitemap.ts`, `robots.ts` (public routes only)

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Server state | TanStack Query (client islands) |
| Forms / validation | react-hook-form + Zod |
| Auth | better-auth (Mongo adapter) |
| Database | MongoDB 7 (Docker locally, Atlas on Vercel) |
| Music / lyrics | Deezer public API, LRCLIB |
| Tooling | ESLint, React Compiler, `tsc --noEmit` |

---

## Architecture

Dependency flows **inward**. Pages stay thin; features own behavior; contracts own shapes.

```text
app/(public|private|auth|onboarding)   thin routes: metadata, loading, error
        ↓
features/*                             screens, hooks, schemas, feature UI
        ↓
components / layouts / providers       shared chrome and client islands
        ↓
connections/*                          Deezer fetchers, Mongo repositories
contracts/*                            Zod schemas (source of truth)
lib/*                                  auth, db, seo, http (secrets stay here)
```

### Route groups

| Group | Role | Rendering |
| --- | --- | --- |
| `(public)` | Home, search — crawlable HTML | SSR / streamed RSC; no auth gate that blanks the page |
| `(private)` | Library | `force-dynamic` + onboarding gate |
| `(auth)` | Login / signup | `force-static` shell, minimal JS (no player / Query) |
| `(onboarding)` | Artist picks | Dynamic, noindex |
| `api/` | Mutations, session JSON, Deezer proxies | Dynamic; personalized responses `private, no-store` |

### Feature modules

```text
features/<domain>/
  index.tsx       screen export
  apis/           use-*.query.ts / use-*.mutate.ts
  components/     feature-only UI
  schemas/        zod forms
```

Pages re-export the feature (or a few server awaits + Suspense). Business logic does not live in `page.tsx`.

### Data rules

| Kind | Where | Cache |
| --- | --- | --- |
| Public catalog | `connections/*` from Server Components | Time-based revalidate (ISR-style) |
| Search | Server + `searchParams` | Usually `no-store` |
| Library / recommendations / auth | Route Handlers + session | Never shared ISR |
| Interactive UI | Client islands + TanStack Query | Invalidate on mutation |

> **Cache what’s public and shared. Render what’s private per request. Hydrate what’s interactive.**

Longer playbook: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · rendering/SEO checklist: [`guide-next.md`](./guide-next.md)

---

## Clean code conventions

- **Types from Zod** — `z.infer`; no duplicate hand-written API interfaces
- **Narrow before use** — check API `status` (or equivalent) before reading `.data`
- **Single sources of truth** — routes in `routes/paths.ts`, copy in `messages/en/`, shapes in `contracts/`
- **Minimal `"use client"`** — leaves only (forms, player, menus); pages/data loaders stay Server Components when possible
- **No secrets in git** — real values in `.env.local` / Vercel; template in `.env.example`
- **Correctness gate** — `npm run typecheck` / `npm run build` must pass

---

## Project structure

```text
src/
  app/              Route groups + API handlers
  features/         auth, home, search, library, onboarding
  components/       layout chrome (navbar, sidebar, player)
  connections/      Deezer + Mongo data access
  contracts/        Zod schemas / shared types
  layouts/          Composed app shells
  providers/        React Query, player state
  lib/              auth, mongodb, seo, rate-limit, http
  messages/en/      UI copy
  routes/paths.ts   Central path builders
```

### Main routes

| Path | Description |
| --- | --- |
| `/` | Guest explore or personalized home |
| `/login`, `/signup` | Auth |
| `/onboarding` | Required artist picks after signup |
| `/search` | Catalog search |
| `/playlists`, `/playlists/[id]` | Playlists |
| `/favorites/songs` | Favorite songs |
| `/favorites/artists` | Favorite artists |

---

## Prerequisites

- Node.js **20.9+**
- npm
- Docker (local MongoDB)

---

## Setup

### 1. Install

```bash
npm install
```

### 2. MongoDB

```bash
npm run db:up
```

Host port **`27018`** → container `27017`.

### 3. Environment

Copy [`.env.example`](./.env.example) to `.env.local`:

```env
BETTER_AUTH_SECRET=generate-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_URI=mongodb://127.0.0.1:27018
MONGODB_DB_NAME=sea-music-player

# Optional — Google sign-in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false
```

Generate a secret: `openssl rand -base64 32`.

Google redirect (local): `http://localhost:3000/api/auth/callback/google`  
Set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` when Google secrets are configured.

No Deezer API key is required.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:up` / `db:down` | Start / stop MongoDB |

---

## Deploy (Vercel)

Use [MongoDB Atlas](https://www.mongodb.com/atlas) (Vercel cannot run Docker Mongo). Full env checklist: [`env.md`](./env.md).

1. Atlas cluster + user + Network Access `0.0.0.0/0`
2. Import the repo at [vercel.com/new](https://vercel.com/new) (Next.js, Node 20+)
3. Set `BETTER_AUTH_SECRET`, `MONGODB_URI`, `MONGODB_DB_NAME`
4. Set `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` on **Production** only
5. Optional Google secrets + `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` + Production callback URI
6. Deploy and smoke-test `/`, signup, login, library

---

## Performance & security (highlights)

| Concern | Approach |
| --- | --- |
| Guest home | Async RSC sections + `<Suspense>` streaming |
| Auth bundle | Static layout without player / React Query |
| Images | `next/image` with `sizes` + blur placeholders |
| Private JSON | `Cache-Control: private, no-store` |
| Deezer proxies | IP rate limit (`429` + `Retry-After`) |
| Personalized feeds | Never shared CDN / ISR cache |

---

## License

Private / unlicensed unless you add a license file.
