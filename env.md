# Vercel environment variables

Add these in **Vercel → Project → Settings → Environment Variables**.

Apply **Production**, **Preview**, and **Development** as noted. Redeploy after changing env vars.

## Required

| Name | Environments | Notes |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Production, Preview, Development | `openssl rand -base64 32` (same secret across envs is fine) |
| `MONGODB_URI` | Production, Preview, Development | Atlas SRV URI. Network Access must allow `0.0.0.0/0` |
| `MONGODB_DB_NAME` | Production, Preview, Development | e.g. `sea-music-player` |

## Production URLs (Production only)

Set these on **Production** only. Preview deploys use `VERCEL_URL` automatically (`src/lib/seo.ts`).

| Name | Example |
| --- | --- |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` (or custom domain) |
| `NEXT_PUBLIC_APP_URL` | same as `BETTER_AUTH_URL` |

No trailing slash.

## Optional — Google OAuth

| Name | Environments | Notes |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Production (+ Preview if you need Google there) | OAuth client id |
| `GOOGLE_CLIENT_SECRET` | same | OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | same | set to `true` to show the Google button |

Without these, email/password auth still works; the Google button is hidden.

### Google Cloud Console

Authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://your-app.vercel.app/api/auth/callback/google
```

If you use a custom domain, add that host too:

```text
https://www.your-domain.com/api/auth/callback/google
```

Preview deployments use unique `*.vercel.app` URLs. Google does not support wildcards — either add each preview URL, skip Google on Preview, or test OAuth on Production only.

## MongoDB Atlas

1. Create a free cluster.
2. **Database Access** — create a user; put the password in `MONGODB_URI` (URL-encode special characters).
3. **Network Access** — allow `0.0.0.0/0` (Vercel Hobby has no fixed egress IP).
4. Connect → Drivers → copy the `mongodb+srv://…` string into `MONGODB_URI`.
5. Keep the database name in `MONGODB_DB_NAME` (the app selects the DB in code).

Example:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=sea-music-player
```

## Deploy checklist

1. [ ] Atlas cluster + user + `0.0.0.0/0` network access  
2. [ ] Env vars set in Vercel (secret, Mongo, Production URLs)  
3. [ ] Import GitHub repo at [vercel.com/new](https://vercel.com/new) — Framework: **Next.js**, Node **20+**  
4. [ ] Deploy succeeds (`npm run build` locally first if unsure)  
5. [ ] Google redirect URI matches Production URL (if using Google)  
6. [ ] Smoke test: `/` loads, `/signup` + email works, `/login` works, library after onboarding  

Preview / git branch URLs (`*-git-main-*.vercel.app`) are trusted via `https://*.vercel.app` in code — you do not need to list each one in Vercel env. Keep `BETTER_AUTH_URL` as your **stable Production** domain only.

For Google OAuth on preview/git URLs, either:
- test Google on the Production domain, or
- add that exact host’s callback in Google Console:

```text
https://YOUR-DEPLOYMENT.vercel.app/api/auth/callback/google
```

## Common failures

| Symptom | Fix |
| --- | --- |
| `Invalid origin: …vercel.app` | Redeploy after trusted-origins fix; use Production domain or ensure code includes `*.vercel.app` |
| `MONGODB_URI is not set` / 503 on auth | Add Atlas URI; check Network Access |
| OAuth redirect mismatch | Add exact Production callback URI in Google Console |
| Google button missing | Set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` and redeploy |
| Wrong site URL on Preview | Do **not** set `BETTER_AUTH_URL` on Preview |
| Build OK, auth broken | Confirm `BETTER_AUTH_SECRET` is ≥ 32 characters |
