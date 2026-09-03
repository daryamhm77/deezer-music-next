# guide-next

Practical rules for **security**, **SEO**, **performance/UX**, and **rendering** in Next.js App Router projects.

Use this as a checklist when starting or reviewing an app. Prefer **matching the data’s privacy and freshness** over picking one rendering mode for the whole site.

---

## 1. Rendering modes (CSR · SSR · SSG · ISR)

| Mode | When to use | Avoid |
| --- | --- | --- |
| **SSG** (`force-static` / fully static) | Marketing, login/signup shells, docs, content that rarely changes | Anything that needs cookies, session, or per-user data |
| **ISR** (`revalidate: N` / cached `fetch`) | Public catalogs, blogs, product lists, third-party public APIs | Personalized feeds, cart, account, recommendations keyed by user |
| **SSR** (`force-dynamic` or request APIs) | Search results, session-aware pages, share pages that need fresh HTML | Overusing it for public lists you could cache |
| **CSR** (client `"use client"` + fetch) | Dashboards, players, forms, interactive islands after shell loads | Making the *only* source of public content (hurts SEO & first paint) |

### Decision rule

1. **Is it public and shareable?** → Prefer SSR or ISR with real HTML.
2. **Is it private / per-user?** → Dynamic SSR shell + CSR islands, or full CSR behind auth. **Never ISR the personalized payload.**
3. **Is it a static shell?** → SSG.
4. **Does it change on a timer but not per user?** → ISR (`next: { revalidate: 60 }` or route `revalidate`).

### Hybrid pattern (recommended)

```text
Server Component page  →  fetch public data (ISR) or session (SSR)
        ↓
Client islands          →  player, forms, mutations, live UI
```

Do **not** wrap the entire app in one client layout that blocks public HTML with “Loading…”.

---

## 2. Rendering / Next.js architecture

### Split public vs private

```text
app/
  (public)/     # home, search, marketing — Server Components first
  (private)/    # library, settings — force-dynamic + auth gate
  (auth)/       # login/signup — force-static, light bundle
  api/          # Route Handlers
```

| Layout | Include | Exclude |
| --- | --- | --- |
| **Public** | Navbar, optional player island, Query only if needed | Hard auth gates that replace HTML with spinners |
| **Private** | Auth/onboarding gate, player, library chrome | Heavy UI on auth pages |
| **Auth** | Minimal shell | Player, React Query, sidebar |

### Data access

| Kind | Call from | Cache |
| --- | --- | --- |
| Public reads (catalog, CMS) | Server Components / `connections/*` | `fetch(..., { next: { revalidate: 60 } })` |
| Search / query pages | Server Components with `searchParams` | Usually **no-store** |
| Mutations (POST/PATCH/DELETE) | Route Handlers | `force-dynamic`, never shared cache |
| Personalized reads | Route Handlers or server with user id | `private, no-store` — **no ISR** |

Prefer:

```ts
// Server Component / connection
const data = await deezerFetch("/chart/0/tracks", { revalidate: 60 });
```

Over:

```ts
// Browser → /api → upstream (extra hop, harder to cache correctly)
await fetch("/api/deezer/tracks");
```

Keep `/api/*` for **mutations**, auth, and thin clients that cannot call the origin directly.

### Client islands

- Mark only interactive leaves `"use client"` (player, forms, menus).
- Keep **pages and data loaders** as Server Components when possible.
- Pass server-fetched props into client grids instead of refetching the same public data on mount (unless refreshing).

---

## 3. SEO

### Must-haves

1. **`generateMetadata` (or `metadata`) per public route**  
   Title, description, canonical, Open Graph, Twitter.
2. **`metadataBase`** in root layout so relative OG URLs resolve.
3. **Server-render public content** so crawlers see text/links in HTML, not an empty shell.
4. **`sitemap.ts`** — public URLs only.
5. **`robots.ts`** — allow public; disallow `/api/*`, private areas, onboarding, drafts.
6. **Canonical URLs** — one preferred URL per page (include query only when it changes meaning, e.g. search `q`).
7. **OG images** — real covers/heroes when available (CDN allowlisted in `next.config`).

### Do / don’t

| Do | Don’t |
| --- | --- |
| Put song/product titles in SSR HTML | Hide all guest content behind client-only gates |
| `noindex` private routes | Put `/playlists/[id]` in the sitemap |
| JSON-LD for `WebSite` / `ItemList` when useful | Duplicate conflicting titles across layout + page |
| Semantic links (`<a href>`) to external/source pages | Rely only on `onClick` for important URLs |

### Metadata helper pattern

Centralize so every public page stays consistent:

```ts
buildPageMetadata({
  title: "Discover music",
  description: "...",
  path: "/",
  image: coverUrl,      // optional OG image
  index: true,          // false for private routes
});
```

---

## 4. Performance / UX

### Streaming

- Split slow public sections into **async Server Components**.
- Wrap each in `<Suspense fallback={...}>` so the shell paints early.
- Example: guest home → songs / genres / artists stream separately.

### Loading & errors

Add per segment:

- `loading.tsx` — skeleton, not a blank screen  
- `error.tsx` — client boundary with retry  

Prefer route-level UI over silent CSR “forever loading”.

### Images

- Always use `next/image`.
- Set **`sizes`** for responsive layouts.
- Use **`placeholder="blur"`** + small `blurDataURL` for perceived speed.
- Allowlist remote hosts in `next.config` (`images.remotePatterns`).

### Prefetch

- `<Link prefetch>` for primary nav (home, search entry).
- `router.prefetch('/search')` when the search UI mounts.
- Don’t prefetch every private deep link aggressively.

### Bundles

- Keep heavy providers (player, React Query) off **auth** and pure marketing routes.
- Lazy-load rare modals when they hurt initial JS.
- Prefer server data for first view; hydrate interactions second.

---

## 5. Security / correctness

### Caching & privacy (critical)

| Response type | Rule |
| --- | --- |
| Session / cookies | `force-dynamic` + `Cache-Control: private, no-store` |
| Library, onboarding status, recommendations | **Never** shared ISR / CDN cache |
| Public catalog | Time-based revalidate OK |
| Personalized “for you” | Assemble per request; don’t cache the final user payload |

If you ISR a personalized JSON endpoint, **users can see each other’s taste**.

### Auth & secrets

- Keep DB clients, auth secrets, and privileged SDKs **server-only** (`lib/`, Route Handlers, Server Actions).
- Never expose `MONGODB_URI`, auth secrets, or admin tokens to the client.
- Validate bodies with Zod (or similar) on mutations.

### Public API exposure

If you expose proxy routes (e.g. `/api/deezer/*`):

- **Rate-limit** by IP (or API key); return `429` + `Retry-After`.
- Prefer Server Components calling upstream directly for pages.
- Don’t return other users’ data from a “public” handler.

### Headers checklist for private JSON

```http
Cache-Control: private, no-store
```

Plus route segment:

```ts
export const dynamic = "force-dynamic";
```

---

## 6. Route segment cheatsheet

```ts
// Static auth / marketing shell
export const dynamic = "force-static";

// Private app / mutations / personalized
export const dynamic = "force-dynamic";

// Public catalog Route Handler or page data
export const revalidate = 60;

// fetch
await fetch(url, { next: { revalidate: 60 } }); // ISR-style
await fetch(url, { cache: "no-store" });        // search / private
```

---

## 7. Suggested project checklist

**Architecture**

- [ ] `(public)` / `(private)` / `(auth)` route groups  
- [ ] Client islands only where interaction needs them  
- [ ] Public reads via `connections/*` on the server  

**SEO**

- [ ] `metadataBase`, per-route metadata, canonical, OG  
- [ ] `sitemap.ts` + `robots.ts`  
- [ ] Guest HTML not blocked by auth loading shells  

**Performance**

- [ ] Suspense streaming for multi-section public pages  
- [ ] `loading.tsx` / `error.tsx` on main segments  
- [ ] `next/image` with `sizes` + blur  
- [ ] Prefetch primary routes  

**Security**

- [ ] No ISR/shared cache on session-bound APIs  
- [ ] Secrets server-only  
- [ ] Rate limits on public proxy APIs  

---

## 8. Anti-patterns

1. One giant `"use client"` app root.  
2. ISR on `/api/me`, recommendations, carts, or any cookie-keyed response.  
3. Public pages that only fetch in `useEffect` (empty HTML for crawlers).  
4. Auth layout that loads the full player + React Query stack.  
5. Sitemap entries for private URLs.  
6. Caching personalized responses “for speed” without per-user cache keys (and usually you shouldn’t cache them at the CDN at all).

---

## 9. Mental model

> **Cache what’s public and shared.  
> Render what’s private per request.  
> Hydrate what’s interactive.**

That single rule covers most Next.js architecture, SEO, performance, and security choices.
