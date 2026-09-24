# NISQ Vanguard — Production Auth & Database Fix Report

**Target Project Ref**: `cbyoozhtubavksiolgxz`  
**Target Project URL**: `https://cbyoozhtubavksiolgxz.supabase.co`

---

## A. ROOT CAUSE — DATABASE ERROR ("Database Connection Error")

1. **Vercel Build Environment Variables**:
   In Vite/TanStack Start single-page and SSR applications, environment variables prefixed with `VITE_` (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are baked into the compiled bundle at build time.
   If Vercel's **Production** environment variables are not populated, or if the anonymous client cannot establish a connection, the Supabase client throws an error or queries fail.

2. **Query Error Catching**:
   The catalog query in `src/routes/academy.tsx` caught the connection exception and displayed the diagnostic error state. Once valid Vercel production environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are provided and the database migrations in `supabase/migrations/` have been executed, the query resolves published records.

---

## B. ROOT CAUSE — LOGIN LOOP (`/auth/callback#access_token=...` -> `/login`)

1. **Hash Fragment OAuth vs Query Code**:
   When Supabase redirects after Google OAuth, the tokens are supplied in the URL hash fragment (`#access_token=...&refresh_token=...`). If `setSession` is executed asynchronously and the app navigates immediately to `/dashboard`, the TanStack Router `_authenticated` route guard ran `supabase.auth.getUser()`.

2. **`beforeLoad` Race Condition in `_authenticated/route.tsx`**:
   The `_authenticated` route's `beforeLoad` hook previously executed only `supabase.auth.getUser()`, which makes a remote API call to Supabase. Before the newly set session was fully written or if there was an in-flight token synchronization latency, `getUser()` failed and immediately threw a redirect back to `/login`.

3. **The Fix**:
   - `src/routes/auth.callback.tsx` parses `#access_token` and `#refresh_token`, executes `supabase.auth.setSession`, strips the sensitive tokens from the browser URL (`history.replaceState`), syncs the profile safely, and navigates.
   - `src/routes/_authenticated/route.tsx` now inspects `supabase.auth.getSession()` first (immediate in-memory/localStorage session check) before falling back to `getUser()`, preventing false-positive redirects to `/login`.

---

## C. FILES CHANGED

- [`src/routes/_authenticated/route.tsx`](file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/src/routes/_authenticated/route.tsx) — Check `getSession()` first in `beforeLoad` to prevent OAuth redirect bounce to `/login`.
- [`src/routes/auth.callback.tsx`](file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/src/routes/auth.callback.tsx) — Added direct hash token parsing, instant session establishment, sanitized browser history, and resilient profile sync.
- [`src/routes/academy.tsx`](file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/src/routes/academy.tsx) — Differentiated loading, database errors, empty database catalog, and active search filter empty results.
- [`AUTH_SETUP.md`](file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/AUTH_SETUP.md) — Documented exact production OAuth redirect URIs and project references.
- [`DATABASE_DEPLOYMENT.md`](file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/DATABASE_DEPLOYMENT.md) — Comprehensive guide for manual database migration deployment.
- [`PRODUCTION_ACCEPTANCE.md`](file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/PRODUCTION_ACCEPTANCE.md) — Production acceptance status and test matrix.
- [`scripts/verify-production-db.sql`](file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/scripts/verify-production-db.sql) — SQL verification script to count all production table records.

---

## D. REQUIRED DATABASE MIGRATION

All 21 migrations exist in [`supabase/migrations/`](file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/supabase/migrations/). No destructive changes are required.

To push all migrations to `cbyoozhtubavksiolgxz`:

```bash
npx supabase db push --project-ref cbyoozhtubavksiolgxz
```

---

## E. REQUIRED VERCEL ENVIRONMENT VARIABLES

In **Vercel Dashboard → Project Settings → Environment Variables**:

Ensure the following are set for **Production**, **Preview**, and **Development**:

| Variable Name               | Environment              | Value                                      | Description                                     |
| --------------------------- | ------------------------ | ------------------------------------------ | ----------------------------------------------- |
| `VITE_SUPABASE_URL`         | Production, Preview, Dev | `https://cbyoozhtubavksiolgxz.supabase.co` | Supabase Project URL                            |
| `VITE_SUPABASE_ANON_KEY`    | Production, Preview, Dev | `<anon_public_key>`                        | Publishable Anonymous Key                       |
| `SUPABASE_URL`              | Production, Preview, Dev | `https://cbyoozhtubavksiolgxz.supabase.co` | Server-side Supabase URL                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Dev | `<service_role_key>`                       | Server-side only key (Never use `VITE_` prefix) |

> [!IMPORTANT]
> After updating Environment Variables in Vercel, you **MUST trigger a new deployment** (Redeploy) for the variables to be baked into the client bundle.

---

## F. REQUIRED SUPABASE AUTH SETTINGS

In Supabase Dashboard for `cbyoozhtubavksiolgxz`:

1. **Authentication → URL Configuration**:
   - **Site URL**: `https://<your-vercel-domain>.vercel.app`
   - **Redirect URLs**:
     - `http://localhost:5173/auth/callback`
     - `https://<your-vercel-domain>.vercel.app/auth/callback`
     - `https://<your-custom-domain>/auth/callback` (if applicable)

2. **Authentication → Providers → Google**:
   - Enable Google provider.
   - Enter **Client ID** and **Client Secret**.

---

## G. REQUIRED GOOGLE CLOUD SETTINGS

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials → OAuth 2.0 Client IDs**:

- **Authorized JavaScript origins**:
  - `http://localhost:5173`
  - `https://<your-vercel-domain>.vercel.app`
- **Authorized redirect URIs**:
  - `https://cbyoozhtubavksiolgxz.supabase.co/auth/v1/callback`

---

## H. LIVE TEST RESULTS

- **TypeScript Compilation**: `VERIFIED` (`npx tsc --noEmit` exited 0).
- **Vite Production Build**: `VERIFIED` (`npm run build` completed SSR and Client bundles with 0 errors).
- **Docker Lab Runner Unit Tests**: `VERIFIED` (`lab-runner/tests/server.test.mjs` 2/2 passing).
- **OAuth Hash Session Handling**: `VERIFIED` in code (`auth.callback.tsx` parses hash params, sets session, sanitizes URL).
- **Protected Route Guard**: `VERIFIED` in code (`_authenticated/route.tsx` avoids false-positive unauthenticated redirects).
- **Live Google Login**: `NOT TESTABLE` (Awaiting live user browser sign-in after Vercel redeploy).
- **Live DB Connection on Deployed Site**: `NOT TESTABLE` (Requires Vercel environment variables & manual migration push).

---

## I. REMAINING BLOCKERS

1. **Vercel Production Environment Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be configured in Vercel settings and redeployed.
2. **Manual Migration Push**: Apply migrations from `supabase/migrations/` to `cbyoozhtubavksiolgxz`.
3. **Local Docker Lab Runner Production Limitation**: Vercel deployed in the cloud cannot directly connect to a local computer's `http://127.0.0.1:8080`. For cloud production lab execution, the Lab Runner service must be hosted on a reachable HTTPS endpoint (e.g. AWS ECS, GCP Cloud Run, or Fly.io) and specified in `LAB_RUNNER_URL`. For local testing, `http://127.0.0.1:8080` remains fully functional.

---

## J. EXACT MANUAL ACTIONS

1. **Step 1**: In Vercel Project Settings → Environment Variables, add `VITE_SUPABASE_URL=https://cbyoozhtubavksiolgxz.supabase.co` and `VITE_SUPABASE_ANON_KEY=<your-anon-key>` to **Production**.
2. **Step 2**: In Supabase Dashboard (`cbyoozhtubavksiolgxz`) → Authentication → URL Configuration, ensure your Vercel URL is added to **Site URL** and **Redirect URLs** (`https://<domain>/auth/callback`).
3. **Step 3**: In Google Cloud Console, ensure Authorized Redirect URI is `https://cbyoozhtubavksiolgxz.supabase.co/auth/v1/callback`.
4. **Step 4**: Push database migrations with `npx supabase db push --project-ref cbyoozhtubavksiolgxz`.
5. **Step 5**: Commit and push changes to git, then trigger a fresh Vercel deployment.
