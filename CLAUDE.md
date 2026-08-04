@AGENTS.md
# CLAUDE.md — Frontend Engineering Playbook

> **How to use this file**
>
> 1. Copy this file into any repo as `CLAUDE.md` (Claude Code) and/or `AGENTS.md` (Cursor).
> 2. Fill in the **Project Passport** (§0) with that repo’s stack and paths.
> 3. Keep the rest as-is unless the project deliberately diverges — then document the exception, don’t silently ignore the rule.
>
> Agents: read this before writing code. Prefer matching existing patterns over inventing new ones.

---

## 0. Project Passport *(fill per repo)*

| Field | Value |
| --- | --- |
| Project name | `x-app` |
| Domain | X (Twitter) clone — social feed, posts, profiles |
| Framework | Next.js App Router (monolith: Route Handlers + Mongoose) |
| Language | TypeScript (strict) |
| UI kit | shadcn/ui + Tailwind + local wrappers under `components/ui` |
| Data fetching | TanStack Query + typed API client (`connections/api.connection`) |
| Forms | react-hook-form + zod |
| i18n | English-first (no next-intl yet) |
| State | zustand (client) + React Query (server) |
| Styling | Tailwind v4 + CSS variables / design tokens |
| Package manager | npm |
| Database | MongoDB (Docker Compose) via Mongoose |
| Correctness gate | `npm run typecheck` / `npm run build` (type-check must pass) |

### Commands *(adapt)*

```bash
npm run dev         # local app
npm run build       # production build + type-check
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run db:up       # start MongoDB (Docker)
npm run db:down     # stop MongoDB
```

### Path aliases *(adapt)*

- `@/*` → `src/*`

---

## 1. Agent operating rules

### Do

- **Match the house style** — read a nearby file of the same kind before writing a new one.
- **Minimal diffs** — change only what the task requires. No drive-by refactors, no unrelated renames.
- **Reuse before invent** — search for existing hooks, components, utils, contracts first.
- **Types from schemas** — prefer `z.infer<typeof Schema>` over hand-written interfaces for API/forms.
- **Narrow before access** — for discriminated unions (`status`, `kind`, `type`), narrow first; never reach into the wrong branch.
- **Barrels** — export new public symbols from the folder’s `index.ts`; import from the folder, not deep file paths (unless the codebase already does otherwise).
- **Ask when ambiguous** — architecture forks, destructive ops, or secrets: clarify before acting.

### Don’t

- Don’t invent parallel patterns (“just this once I’ll call fetch directly”).
- Don’t hardcode routes, colors, copy, or magic strings that already live in constants/i18n/theme.
- Don’t commit secrets. Prefer `.env.local` for real tokens; never put production secrets in tracked `.env`.
- Don’t weaken TypeScript (`as any`, `@ts-ignore`, `ignoreBuildErrors: true`) to silence errors — fix the type.
- Don’t put business logic in route/page files when the project uses feature modules.
- Don’t expand scope (“while I’m here…”) unless asked.

### Git / PR hygiene *(when asked)*

- Commit only when explicitly requested.
- Never update git config, force-push main, or skip hooks unless asked.
- Prefer clear messages focused on **why**, not a file list.
- PRs: summary + test plan; don’t push unless asked.

---

## 2. Architecture principles

These are the non-negotiables. Every feature should respect them.

### 2.1 Layered ownership

```
Routes / Pages     → thin: metadata + re-export feature
Features           → screens, feature hooks, feature UI, feature schemas
Shared components  → reusable UI (design system + composites)
Connections        → API/socket clients
Contracts          → API & realtime shapes (source of truth)
Providers / lib    → app-wide wiring (query client, auth, theme)
```

**Rule:** dependency flows **inward/downward**. Features may import shared/ui/contracts/connections. Shared must not import features. Pages must not contain business logic.

### 2.2 Single source of truth

| Concern | Where it lives |
| --- | --- |
| API request/response shapes | Contracts (zod) |
| Form validation | Feature `schemas/` or shared `validations/` |
| Routes | Central `paths` / router helpers |
| Copy / labels | i18n message files |
| Design tokens / colors | Theme + CSS variables |
| Static option lists | `constants/` |
| Server cache keys | Query hooks (stable, namespaced keys) |

Never duplicate a type, path, or label in a second place “for convenience.”

### 2.3 Feature-first modules

Each screen/domain is a self-contained feature:

```
features/<domain>/
├── index.tsx              # default screen export
├── apis/                  # use-*.query.ts / use-*.mutate.ts + index.ts
├── components/            # feature-local UI
├── hooks/                 # feature-local hooks (e.g. columns)
├── schemas/               # zod form schemas
├── types.ts               # z.infer types from contracts
├── store/                 # optional zustand (client-only UI state)
└── styles.module.css
```

Large domains nest `modules/<sub>/` with the same shape.

### 2.4 Thin pages

```tsx
// app/.../page.tsx  — ONLY this
import { VehiclesFeature } from '@/features/resources/modules/vehicles';
export const metadata = vehiclesMetadata;
export default VehiclesFeature;
```

All hooks, state, and rendering live in the feature.

### 2.5 Server state vs client state

| Kind | Tool | Examples |
| --- | --- | --- |
| Server / remote | TanStack Query | lists, details, mutations + invalidation |
| Client / UI | zustand or local React state | modal open, wizard step, ephemeral filters not in URL |
| URL | nuqs / searchParams | table page, sort, filters that should be shareable |

Don’t stash server data in zustand. Don’t put modal-open flags in React Query.

---

## 3. Recommended directory map

Adapt names to the stack, keep the separation of concerns.

```
src/
├── app/                    # Framework routes (thin)
├── apis/                   # Cross-feature API hooks (rare)
├── components/
│   ├── ui/                 # Design-system primitives (wrappers)
│   ├── shared/             # Composite reusable components
│   ├── layout/             # App chrome (header, sidebar)
│   └── feedback/           # toast / notifications helpers
├── connections/            # API client, socket client, response helpers
├── contracts/
│   ├── endpoints/          # One file (or folder) per domain
│   └── socket/             # Realtime event contracts
├── features/               # Feature modules (see §2.3)
├── layouts/                # Composed layout shells
├── providers/              # React context providers
├── hooks/                  # Generic reusable hooks
├── lib/                    # Singletons (queryClient, etc.)
├── config/                 # env, cookies, metadata, fonts
├── constants/              # Static option lists
├── validations/            # Shared zod schemas
├── routes/paths.ts         # Centralized route builders
├── i18n/ + messages/       # Locale config + translation JSON
├── styles/                 # Global CSS + component overrides
├── types/                  # Global ambient types
└── utils/                  # Pure helpers (no React)
```

---

## 4. API contracts (source of truth)

### 4.1 Why contracts exist

Every backend endpoint is declared once with:

- HTTP method + path
- Auth requirement
- **zod request schema**
- **zod response schema**
- Optional **mock data** (so UI can run without a backend)

Types are **inferred** from zod — never hand-duplicated.

### 4.2 Contract shape

```ts
export const vehiclesContracts = {
  resourcesVehicles: {
    getList: {
      method: 'GET',
      path: '/resources/vehicles',
      auth: true,
      request: z.object({ /* query/body */ }),
      response: apiResponseWrapper(z.array(VehicleSchema)),
      mockData: mockDataWrapper([/* ... */]),
    },
    createVehicle: { /* ... */ },
  },
} satisfies Contracts;
```

Aggregate domains in `contracts/index.ts` and pass them into the typed client.

### 4.3 Response envelope — MEMORIZE

Prefer a **discriminated union on `status`** (or `ok` / `success`):

```ts
type SuccessfulApiResponse<Data> = { status: 200; data: Data; pagination?: Pagination };
type FailedApiResponse = { status: ApiErrorStatus; message: string };
type ApiResponse<Data> = SuccessfulApiResponse<Data> | FailedApiResponse;
```

**You MUST narrow before reading `.data` or `.message`:**

```ts
const res = await api.resourcesVehicles.getList(params);
if (res.status !== 200) {
  throw new Error(res.message);
}
return res.data; // safe
```

Accessing `res.data` without narrowing is a type error *and* a runtime bug. Do not reintroduce it.

### 4.4 Client usage

```ts
import api from '@/connections/api.connection';

await api.resourcesVehicles.getList(params);
await api.patients.create(body);
```

- Token via cookie/header provider on the client — features don’t pass tokens manually.
- Mock mode reads `mockData` from contracts when enabled.

---

## 5. Data-fetching hooks (TanStack Query)

Place hooks in the feature’s `apis/`:

- Reads: `use-*.query.ts`
- Writes: `use-*.mutate.ts`
- Re-export from `apis/index.ts`

### Query pattern

```ts
export function useGetVehiclesQuery(params: DataTableParams) {
  const query = useQuery({
    queryKey: ['resources-vehicles', params], // stable, namespaced
    queryFn: async () => {
      const res = await api.resourcesVehicles.getList(params as never);
      if (res.status !== 200) throw new Error(res.message);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    // ...
  };
}
```

### Mutation pattern

```ts
type CreateVehicleRequest = z.infer<typeof contracts.resourcesVehicles.createVehicle.request>;

export const useCreateVehicleMutate = (onSuccess: () => void, onError: () => void) => {
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateVehicleRequest) => api.resourcesVehicles.createVehicle(data),
    onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources-vehicles'] });
      onSuccess();
    },
  });
  return { mutate, isPending };
};
```

**Rules**

- Derive request types with `z.infer` — don’t redeclare.
- Invalidate related query keys on success.
- Prefer a shared `queryClient` singleton with sensible defaults (`retry: false` for dashboards is fine if that’s the house style).
- Query keys: `['domain-resource', ...params]` — consistent prefixes make invalidation reliable.

---

## 6. UI system

### 6.1 Design-system wrappers

`components/ui/*` are thin wrappers around the UI kit:

- Apply product defaults (color, radius, size).
- Expose a **curated** prop type (subset of the kit’s props).
- Absorb kit breaking changes so features keep a stable API.

```ts
// Prefer this in features:
import { Button, Select, TextInput } from '@/components/ui';

// Avoid importing the raw kit in feature code unless the wrapper is missing a needed prop.
// If a prop is missing: add it to the wrapper’s types — don’t cast with `any`.
```

### 6.2 Shared vs feature components

| Location | When |
| --- | --- |
| `components/ui` | Primitive, used everywhere |
| `components/shared` | Composite, reused across ≥2 features |
| `features/.../components` | Used by one feature only |

Promote to shared only when a second feature needs it — don’t preemptively “make it generic.”

### 6.3 Data tables *(if the project has one)*

Compose in three steps:

1. **Columns hook** → `ColumnDef[]`
2. **`useDataTable`** → binds columns + query hook + URL state
3. **`<DataTable>`** → declarative filters

Filter configs should be a **discriminated union** on `type` (`select`, `multiselect`, `sort`, `async-search`, `date-range`, …). Option values are strings when feeding select inputs (`String(id)`).

---

## 7. Styling & theming

### Rules

1. **CSS Modules** (`styles.module.css`) imported as `classes` — default for component styles.
2. **No raw hex/rgb in components** — use theme CSS variables / tokens.
3. **Theme-aware styles** use the project’s light/dark helper (e.g. `light-dark()`):

```css
background: light-dark(var(--mantine-color-white), var(--mantine-color-neutral-9));
border-color: light-dark(var(--mantine-color-neutral-2), var(--mantine-color-neutral-8));
```

4. Prefer the product palette (`primary`, `secondary`, `neutral`, `success`, `error`, …) over kit defaults (`gray`, `blue`) when a custom palette exists.
5. White text on a colored fill stays white in both themes — don’t wrap it in light/dark.
6. When adding styles, verify **both** color schemes.

### What not to do

- Inline hardcoded colors
- One-off global CSS for a single feature (prefer the feature’s CSS module)
- Cards/shadows/borders that don’t aid interaction — keep surfaces intentional

---

## 8. Forms

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(FormSchema),
  mode: 'onChange', // or house default
});
```

- Schema in feature `schemas/` (or shared `validations/` if reused).
- Use `Controller` for non-native design-system inputs.
- Zod error messages as **i18n keys** (e.g. `'plate_number.required'`), resolved via a `useFormError` helper + translations — not raw English strings in schemas when the app is internationalized.
- Validate on the client; never trust the client alone for security (server still validates).

---

## 9. i18n

- No user-facing English (or other) strings hardcoded in components when i18n exists.
- Messages split by domain (`messages/en/*.json`), merged in the i18n request config.
- Usage: `const t = useTranslations('resources.vehicles'); t('title')`.
- Document whether locale lives in the URL (`/[locale]/`) or cookie — don’t “fix” intentional dynamic rendering without understanding why.

---

## 10. Routing, notifications, realtime

- **Routes:** never hardcode path strings in features — use `PATHS` / route builders.
- **Toasts:** one helper (`toast.success|error|warning|info`) — don’t sprinkle kit notification APIs ad hoc.
- **Sockets:** typed contracts for emit/on events; consume via a small hook (`useSocketEvent` / `emitAsync`). Same mock-vs-real switch as HTTP when possible.

---

## 11. Naming conventions

| Kind | Convention | Example |
| --- | --- | --- |
| Components / files | kebab-case | `action-menu.tsx` |
| Hooks | `use-*.ts(x)` | `use-vehicle-columns.tsx` |
| Query hooks | `use-*.query.ts` | `use-get-vehicles.query.ts` |
| Mutation hooks | `use-*.mutate.ts` | `use-create-vehicle.mutate.ts` |
| Types | `types.ts` / `types.d.ts` | feature-local |
| Schemas | `schemas/` or `validations/` | `vehicle-form.schema.ts` |
| CSS modules | `styles.module.css` | colocated |
| Query keys | kebab domain prefix | `['resources-vehicles', params]` |
| Contracts | domain file/folder | `contracts/endpoints/vehicle.ts` |

Booleans: `isLoading`, `hasError`, `canSubmit`. Event handlers: `onSubmit`, `handleClick` (pick one style and stay consistent with the file you’re in).

---

## 12. Clean code checklist

Before finishing a change, verify:

### Correctness

- [ ] `tsc` / build type-check is clean for touched areas
- [ ] API responses narrowed on discriminant before `.data`
- [ ] Mutations invalidate the right query keys
- [ ] Empty / loading / error UI states handled where the pattern expects them

### Structure

- [ ] Logic lives in the feature, not the page
- [ ] New shared code only if reused (or clearly shared by design)
- [ ] Public exports added to barrels
- [ ] No circular imports (feature ↔ feature via shared/contracts instead)

### Types & data

- [ ] Types inferred from zod/contracts where applicable
- [ ] No duplicate interfaces for the same API shape
- [ ] No `any` / unjustified assertions

### UX & i18n

- [ ] User-facing strings go through i18n
- [ ] Styles use tokens + light/dark where needed
- [ ] Routes go through `PATHS`

### Safety

- [ ] No secrets in tracked files
- [ ] Auth-gated endpoints marked `auth: true` (or equivalent)
- [ ] Dangerous actions confirmed in UI when the product requires it

### Diff quality

- [ ] Diff is scoped to the request
- [ ] Existing EOL / formatting style preserved
- [ ] No commented-out dead code left behind

---

## 13. Recipes *(copy-paste workflows)*

### A. Add a new API endpoint

1. Add to `contracts/endpoints/<domain>.ts` — request/response zod + `mockData` + `apiResponseWrapper`.
2. Ensure the domain is spread into `contracts/index.ts`.
3. Client picks it up as `api.<group>.<endpoint>`.
4. Add `use-*.query.ts` or `use-*.mutate.ts` in the feature `apis/` (narrow `status`), export from barrel.
5. Invalidate related keys on mutation success.

### B. Add a new screen / resource

1. Create `features/<domain>/` (+ optional `modules/<sub>/`) with `index.tsx`, `apis/`, `components/`, `types.ts`.
2. Add thin `app/.../page.tsx` that re-exports the feature + metadata.
3. Register path in `routes/paths.ts` and nav if needed.
4. Add i18n keys for the new copy.

### C. Add a form modal

1. Zod schema in feature `schemas/`.
2. `useForm` + `zodResolver` + `Controller` for DS inputs.
3. Mutation hook for submit; toast on success/error.
4. Close modal + invalidate queries on success.

### D. Add a table filter

1. Extend the `filters` array with a typed `FilterConfig`.
2. Ensure filter id matches the query param the list hook reads.
3. For remote options: `async-search` + `fetchOptions` returning `{ value: string; label: string }[]`.

### E. Add/adjust a surface style

1. CSS module + Mantine/token variables.
2. Wrap theme-dependent bg/border/text in light/dark helper.
3. Check light and dark.

---

## 14. Testing expectations

| Layer | Tool *(typical)* | What to cover |
| --- | --- | --- |
| Unit | Jest / Vitest | pure utils, schema parsing, critical hooks |
| Component | Testing Library / Storybook | DS primitives, tricky UI states |
| E2E | Playwright | auth happy path, critical CRUD flows |

Agents: don’t add flaky e2e for tiny UI tweaks unless asked. Prefer unit tests for pure logic. When fixing a bug, add a regression test if the area already has tests.

---

## 15. Error monitoring & env

- Sentry (or equivalent) init at framework-required entrypoints; disabled unless DSN is set so local stays quiet.
- Tracked `.env` may hold non-secret defaults / flags; real secrets → `.env.local` (untracked).
- Document public env vars (`NEXT_PUBLIC_*`) vs server-only.

---

## 16. Performance & React guidelines

- Prefer framework defaults and existing patterns over premature optimization.
- Don’t add `useMemo` / `useCallback` by default unless the file already uses them or profiling shows need (React Compiler projects especially).
- Lists: virtualize only when the product already does / data volume requires it.
- Images: use the framework image component with sizing.
- Avoid fetching in deeply nested children when a parent/query hook already owns the data — lift or share via Query cache.

---

## 17. Security basics for frontend agents

- Never log tokens, passwords, or PII in console/Sentry extras carelessly.
- Don’t disable auth checks “to make the mock work” in production paths.
- Sanitize any `dangerouslySetInnerHTML` / markdown HTML; prefer text.
- Treat all query/hash params as untrusted input.
- CSRF/cookie flags are backend concerns, but don’t invent alternate auth storage (e.g. `localStorage` tokens) if the app uses httpOnly/cookies.

---

## 18. Decision log — when stuck

| Situation | Prefer |
| --- | --- |
| New UI primitive | Extend `components/ui` wrapper |
| Used in one feature | Keep under `features/.../components` |
| New API field | Update contract schema first, then UI |
| Duplicate type vs zod | Delete hand type; `z.infer` |
| Hardcoded path | Add to `PATHS` |
| Hardcoded string | Add i18n key |
| Hardcoded color | Theme token + CSS var |
| “Quick fetch in component” | Feature query/mutation hook |
| Page getting fat | Move to feature module |
| Unclear product behavior | Ask the human |

---

## 19. Anti-patterns (explicit ban list)

1. Business logic in `page.tsx` / route handlers meant to be thin.
2. `res.data` without `status` (or equivalent) narrowing.
3. Hand-written interfaces that duplicate zod contracts.
4. Importing raw UI kit in features when a wrapper exists.
5. Parallel API clients / ad-hoc `fetch` next to the typed client.
6. Server data in zustand; URL state only in local React state when it should be shareable.
7. Magic route strings, magic color hex, magic user-facing copy.
8. `any`, `@ts-expect-error` without a one-line justification comment.
9. Scope creep refactors in bugfix PRs.
10. Committing `.env.local`, keys, or dump files.

---

## 20. Prompt snippets for other projects

Paste these when bootstrapping a new repo’s `CLAUDE.md` passport:

```text
Stack: Next.js App Router, TypeScript strict, Mantine, TanStack Query, zod, RHF, next-intl, zustand, CSS Modules, pnpm.
Architecture: thin pages → feature modules → shared UI → contracts → typed API client.
Rules: types from zod; narrow API unions; barrels; PATHS; i18n for copy; tokens for color; minimal diffs.
Correctness gate: tsc / build must pass. No ignoreBuildErrors.
```

```text
When adding a feature: create features/<name> with apis/, components/, schemas/, types.ts;
add thin page; register PATHS + i18n; contracts before UI.
```

```text
Before finishing: clean code checklist §12, no secrets, no any, styles light+dark, invalidate queries.
```

---

## 21. Reference implementation note

This playbook was distilled from a production-style Next.js dashboard architecture:

- **Contracts** as the API source of truth + mock data
- **Feature modules** with colocated apis/hooks/schemas
- **Thin App Router pages**
- **Design-system wrappers** over a UI kit
- **Discriminated API responses** with mandatory narrowing
- **CSS Modules + theme tokens + light-dark**

When porting to another stack (Vite + React Query, Remix, etc.), keep the *principles* even if folder names change.

---

*End of CLAUDE.md — keep this file short enough to load, long enough to prevent architectural drift. Update §0 per project; update recipes when house patterns evolve.*
