# Architecture Playbook

Reusable rules for **Next.js App Router** products: layered architecture, clean code, rendering (SSG · ISR · SSR · CSR), performance, SEO, and cache privacy.

Copy this file into another repo. Fill the **Passport**. Keep the rest unless that product deliberately diverges — then document the exception.

> **One rule:** Cache what’s public and shared. Render what’s private per request. Hydrate what’s interactive.

---

## 0. Passport *(fill per repo)*

| Field | Value |
| --- | --- |
| Product | |
| Public surfaces | e.g. marketing, catalog, search |
| Private surfaces | e.g. dashboard, library, settings |
| Framework | Next.js App Router |
| Language | TypeScript (strict) |
| Data | Server Components + `connections/*` · TanStack Query for client islands |
| Forms | react-hook-form + zod |
| UI | design-system wrappers, not raw kit in features |
| Correctness gate | `npm run typecheck` / `npm run build` |

---

## 1. Mental model

```text
Route groups split by audience
        ↓
Thin pages: metadata + re-export (or a few awaits)
        ↓
Features own screens, hooks, schemas, UI
        ↓
Connections fetch (server) · Route Handlers mutate / personalize
        ↓
Contracts (zod) are the shape of the data
```

**Dependency direction:** pages → features → shared UI / connections / contracts. Shared never imports features. Pages never grow business logic.

---

## 2. Layered architecture

```text
app/            thin routes: metadata, loading, error, layout chrome
features/       screens, feature hooks, feature UI, schemas
components/     ui (primitives) · shared (composites used ≥2 times) · layout
layouts/        composed shells (navbar + sidebar + main)
connections/    server fetchers, mappers, repositories
contracts/      zod request/response shapes (source of truth)
providers/      Query, player, theme — only on layouts that need them
lib/            auth, db, seo, http helpers (server-only secrets stay here)
routes/paths.ts one place for URLs
messages/       copy (even if English-only today)
```

### Route groups (copy this split)

```text
app/
  (public)/      crawlable HTML — Server Components first
  (private)/     session + user data — force-dynamic, auth gate
  (auth)/        login/signup — static shell, tiny JS
  (onboarding)/  one-time flows — dynamic, noindex
  api/           Route Handlers (mutations, session JSON, proxies)
```

| Layout | Include | Exclude |
| --- | --- | --- |
| **Public** | Nav, optional player island | Auth gates that replace HTML with spinners |
| **Private** | Auth/onboarding gate, app chrome | Heavy chrome on auth pages |
| **Auth** | Minimal shell | Player, React Query, sidebar |

### Thin pages

```tsx
// app/(private)/playlists/page.tsx
export const dynamic = "force-dynamic";
export const metadata = buildPageMetadata({ title: "Playlists", path: PATHS.playlists, index: false });
export default PlaylistsFeature;
```

Public pages may `await` session + stream sections. They still must not contain forms, tables, or mutation logic — that lives in the feature.

### Feature module

```text
features/<domain>/
  index.tsx          screen export
  apis/              use-*.query.ts / use-*.mutate.ts
  components/        feature-only UI
  schemas/           zod forms
  types.ts           z.infer from contracts — do not hand-duplicate
```

Promote a component to `components/shared` only when a **second** feature needs it.

---

## 3. Rendering (SSG · ISR · SSR · CSR)

Pick the mode from **privacy + freshness**, not from habit. Mix modes on one site. Mix Server Components and client islands on one route.

| Mode | Mechanism | Use | Never |
| --- | --- | --- | --- |
| **SSG** | `dynamic = "force-static"` · no cookies/headers | Marketing, docs, login/signup **shells**, legal | Session, cart, per-user feeds |
| **ISR** | `revalidate` / `fetch(..., { next: { revalidate: N } })` | Public catalogs, blogs, CMS, third-party public APIs | Personalized JSON, anything keyed by user |
| **SSR** | `dynamic = "force-dynamic"` or `cookies()` / `searchParams` | Search, share pages that need fresh HTML, session-aware gates | Public lists you could cache for everyone |
| **CSR** | `"use client"` + Query / local state | Dashboards, players, forms, live UI after the shell | The *only* source of public content (hurts SEO and first paint) |

### Decision tree

1. **Public and shareable?** → HTML on the server (SSG, ISR, or SSR).
2. **Static shell, almost never changes?** → SSG.
3. **Public, changes on a timer, same for everyone?** → ISR.
4. **Depends on URL query, cookies, or “right now”?** → SSR.
5. **Private / per-user?** → Dynamic SSR shell + CSR islands. **Never ISR the personalized payload.**
6. **Interactive widget?** → Client island. Keep the page a Server Component.

### Hybrid (default for product apps)

```text
Server Component page
  → public data (ISR) or session (SSR)
  → stream slow sections with <Suspense>
        ↓
Client islands
  → player, forms, filters, mutations, live UI
```

Pass server-fetched props into client grids. Do not refetch the same public payload on mount unless you are refreshing.

```tsx
// Search: SSR first paint, then client Query for refinements
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const initialData = q ? await searchCatalog(q) : null;
  return <SearchFeature query={q ?? ""} initialData={initialData} />;
}
```

```tsx
// Guest home: SSR + independent streams
export default async function HomePage() {
  return (
    <>
      <Intro />
      <Suspense fallback={<SectionSkeleton />}>
        <SongsSection />      {/* async RSC */}
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ArtistsSection />
      </Suspense>
    </>
  );
}
```

### Client islands

- Mark **leaves** `"use client"` (forms, menus, player), not the app root.
- Pages and data loaders stay Server Components when they can.
- Do not wrap the entire app in one client layout that paints “Loading…” instead of HTML.

### Segment config cheatsheet

```ts
export const dynamic = "force-static";   // auth / marketing shell
export const dynamic = "force-dynamic";  // private, search, mutations
export const revalidate = 60;            // public catalog handler/page

await fetch(url, { next: { revalidate: 60 } }); // ISR-style
await fetch(url, { cache: "no-store" });        // search / private
```

`generateStaticParams` for known public IDs (blog posts, product slugs). Pair with ISR if content updates after deploy.

### Next.js 16+ Cache Components *(optional migration)*

If `cacheComponents: true`:

- Routes are dynamic unless you opt into `'use cache'`.
- Prefer `'use cache'` + `cacheLife('hours')` + `cacheTag('catalog')` over `revalidate` exports.
- Wrap request-time data (`cookies`, `headers`, session) in `<Suspense>` so the static shell can still stream.
- **Still never cache personalized payloads** in a shared cache.

Until you flip that flag, keep explicit `dynamic` / `revalidate` on every sensitive route.

---

## 4. Data access

| Kind | Call from | Cache |
| --- | --- | --- |
| Public reads (catalog, CMS) | Server Components / `connections/*` | Time-based revalidate |
| Search / query pages | Server Components + `searchParams` | Usually `no-store` |
| Mutations | Route Handlers (or Server Actions) | `force-dynamic`, never shared cache |
| Personalized reads | Route Handlers or server + user id | `private, no-store` — **no ISR** |

Prefer:

```ts
// Server Component → connection → origin
const tracks = await catalogFetch("/chart/tracks", { revalidate: 60 });
```

Over:

```ts
// Browser → /api → origin (extra hop, easy to cache wrong)
await fetch("/api/catalog/tracks");
```

Keep `/api/*` for **mutations**, auth, session JSON, and clients that cannot call the origin (browser CORS, secrets).

**Contracts first.** Zod schemas own the shape. Features `z.infer` — they do not declare a second interface.

```ts
const res = await api.resource.list(params);
if (res.status !== 200) throw new Error(res.message);
return res.data; // only after narrowing
```

Query keys: `['domain-resource', ...params]`. Mutations invalidate that prefix.

| State | Tool |
| --- | --- |
| Server / remote | TanStack Query (client islands) or RSC await (public) |
| Client / UI | local state or zustand (modal, wizard, player) |
| Shareable filters | URL `searchParams` / nuqs |

Do not stash server lists in zustand. Do not put `isModalOpen` in React Query.

---

## 5. Clean code

### Do

- Match the nearest file of the same kind before inventing a pattern.
- Minimal diffs. No drive-by refactors.
- Types from zod. Narrow discriminated unions before reading `.data`.
- Routes via `PATHS`. Copy via `messages/`. Color via tokens / CSS variables.
- Barrels: import from the folder, not deep paths (unless the repo already does otherwise).
- Server-only secrets stay in `lib/` and Route Handlers.

### Don’t

- Business logic in `page.tsx`.
- Parallel `fetch` helpers next to the typed client / `connections/*`.
- Hardcoded paths, user-facing strings, or hex when constants exist.
- `any`, `@ts-ignore`, `ignoreBuildErrors`.
- Giant `"use client"` roots.
- Duplicate types that already exist as `z.infer`.

### Naming

| Kind | Example |
| --- | --- |
| Files / components | `song-card-grid.tsx` |
| Query hooks | `use-search.query.ts` |
| Mutation hooks | `use-create-playlist.mutate.ts` |
| Booleans | `isLoading`, `hasError`, `canSubmit` |

### Forms

Schema in `features/<domain>/schemas/`. `useForm` + `zodResolver`. Validate on the client; **always** validate again on the server.

### Checklist before merge

- [ ] `tsc` / typecheck clean for touched areas  
- [ ] API unions narrowed before `.data`  
- [ ] Mutations invalidate the right query keys  
- [ ] Loading / empty / error UI where the pattern expects them  
- [ ] Logic in the feature, not the page  
- [ ] No secrets in tracked files  

---

## 6. Performance

### Streaming

Split slow public sections into **async Server Components**. Wrap each in `<Suspense>` so the shell paints first.

### Loading and errors

Per segment:

- `loading.tsx` — skeleton, never a blank screen  
- `error.tsx` — client boundary + retry  

Prefer route-level UI over a CSR spinner that never resolves.

### JavaScript

- Heavy providers (player, React Query) only on layouts that need them. Auth stays light.
- Lazy-load rare modals if they show up in the initial bundle.
- First view from the server; hydrate interactions second.
- React Compiler (`reactCompiler: true`) is fine; do not sprinkle `useMemo` / `useCallback` by default.

### Images

- `next/image` everywhere.
- Set `sizes` for the real layout.
- `placeholder="blur"` + tiny `blurDataURL` when it helps LCP.
- Allowlist remote hosts in `next.config` (`images.remotePatterns`).

### Navigation

- `<Link prefetch>` for primary public nav.
- Prefetch search when the search UI mounts.
- Do not prefetch every private deep link.

### Data

- Cache public GETs (ISR). Do not cache user-specific GETs “for speed.”
- Deduplicate server fetches (`React.cache` / Next fetch cache) instead of prop-drilling through five layouts.
- Lists: virtualize only when the product already does or volume requires it.

---

## 7. SEO (public routes)

1. `metadataBase` in the root layout.  
2. Per-route `generateMetadata` or `metadata`: title, description, canonical, Open Graph, Twitter.  
3. Central helper (`buildPageMetadata`) so pages stay consistent.  
4. **Server-render public content** — crawlers must see text and links, not an empty shell.  
5. `sitemap.ts` — public URLs only.  
6. `robots.ts` — allow public; disallow `/api/*`, private areas, drafts, onboarding.  
7. Canonical: one URL per page. Include query only when it changes meaning (`?q=`).  
8. Semantic `<a>` / `<Link>` for important URLs — not `onClick` only.  
9. JSON-LD (`WebSite`, `ItemList`, `Article`) when it matches the page.  
10. Private routes: `index: false` and stay out of the sitemap.

Do not hide guest content behind a client auth gate. Gate **private** layouts; leave public HTML crawlable.

---

## 8. Security and cache privacy

| Response | Rule |
| --- | --- |
| Session / cookies | `force-dynamic` + `Cache-Control: private, no-store` |
| Library, cart, “for you”, onboarding status | **Never** shared ISR / CDN cache |
| Public catalog | Time-based revalidate OK |
| Personalized payload | Assemble per request |

If you ISR a cookie-keyed JSON endpoint, users can see each other’s data.

```ts
// Private Route Handler
export const dynamic = "force-dynamic";

return NextResponse.json(body, {
  headers: { "Cache-Control": "private, no-store" },
});
```

- DB clients, auth secrets, admin SDKs: server-only.  
- Validate mutation bodies with zod on the server.  
- Public proxy routes: rate-limit; do not return other users’ data.  
- Never log tokens, passwords, or PII.

---

## 9. Recipes

### New public page

1. Thin `app/(public)/…/page.tsx` — metadata + feature (or streamed RSC sections).  
2. Register `PATHS`.  
3. Fetch public data in `connections/*` with revalidate.  
4. Client island only for interaction.  
5. Add to sitemap if it should be indexed.

### New private page

1. `app/(private)/…/page.tsx` with `force-dynamic` and `index: false`.  
2. Feature + Query hooks; mutations go through Route Handlers.  
3. Layout already owns the auth gate — do not duplicate it in the page.

### New mutation API

1. Zod request/response in `contracts/`.  
2. Route Handler: session check, parse body, `privateJson`.  
3. Feature `use-*.mutate.ts` invalidates `['domain-resource']`.

### New form

1. Schema in the feature.  
2. `useForm` + design-system inputs.  
3. Server still validates. Toast on success/error.

---

## 10. Anti-patterns

1. One giant `"use client"` app root.  
2. ISR / shared cache on `/api/me`, recommendations, carts, or any cookie-keyed response.  
3. Public pages that only fetch in `useEffect` (empty HTML for crawlers).  
4. Auth layout that loads the full player + React Query stack.  
5. Sitemap entries for private URLs.  
6. Caching personalized responses without per-user keys (usually: do not CDN-cache them at all).  
7. `res.data` without narrowing `status`.  
8. Hand-written types that duplicate zod.  
9. Magic route strings and magic copy.  
10. Secrets in git.

---

## 11. Suggested review checklist

**Architecture**

- [ ] `(public)` / `(private)` / `(auth)` route groups  
- [ ] Thin pages; logic in features  
- [ ] Client islands only where interaction needs them  
- [ ] Public reads via `connections/*` on the server  

**Rendering**

- [ ] SSG for static shells  
- [ ] ISR for shared public data  
- [ ] SSR for search / session gates  
- [ ] CSR for private interactive surfaces  
- [ ] No ISR on personalized payloads  

**Clean code**

- [ ] Types from contracts; PATHS; messages; tokens  
- [ ] No `any`; no business logic in route files  

**Performance**

- [ ] Suspense streaming for multi-section public pages  
- [ ] `loading.tsx` / `error.tsx` on main segments  
- [ ] `next/image` with `sizes`  
- [ ] Heavy providers off auth routes  

**SEO / security**

- [ ] `metadataBase`, per-route metadata, canonical, OG  
- [ ] `sitemap.ts` + `robots.ts`  
- [ ] Guest HTML not blocked by auth loading shells  
- [ ] `private, no-store` on session JSON  
- [ ] Secrets server-only; rate limits on public proxies  

---

*End of playbook. Update the Passport per product. Update recipes when house patterns evolve.*
