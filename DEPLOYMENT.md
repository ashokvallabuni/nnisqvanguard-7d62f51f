# NISQ Vanguard deployment

The application is configured for Vercel deployment. The repository contains
the Vercel SPA fallback in `vercel.json` and the Netlify fallback in
`public/_redirects`.

## 1. Validate locally

From the repository root:

```powershell
npm install
npx tsc --noEmit
npm run build
```

Create `.env.local` from `.env.example` and set the real public Supabase
values:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Only the anonymous/publishable key belongs in the frontend. Never add a
Supabase service-role key, Google client secret, or private token to Vite
variables.

The lab runner variables are server-side only. They are not required for the
website build and must never be exposed through `VITE_` variables.

## 2. Apply the Supabase database migration

In the Supabase dashboard, open **SQL Editor** and apply the migration:

```text
supabase/migrations/20260921000000_auth_profiles_roles.sql
```

Confirm that `profiles` and `user_roles` exist and that row-level security is
enabled for both tables.

## 3. Configure Google OAuth

Follow [AUTH_SETUP.md](./AUTH_SETUP.md) to configure:

- Google OAuth Client ID
- Google OAuth Client Secret in Supabase only
- Supabase provider callback URL in Google Cloud
- Local and production redirect URLs in Supabase

The frontend callback route is:

```text
https://YOUR_DOMAIN/auth/callback
```

The Google Cloud redirect URI is the Supabase provider callback URL, not the
frontend callback route.

## 4. Deploy through the Vercel dashboard

1. Push the repository to GitHub.
2. In Vercel, select **Add New → Project**.
3. Import `ashokvallabuni/nnisqvanguard-7d62f51f`.
4. Use the detected Vite/TanStack settings:
   - Install command: `npm install`
   - Build command: `npm run build`
5. Add these Production environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy the project.
7. Add the Vercel production domain to Supabase **Authentication → URL
   Configuration → Redirect URLs**.
8. Add the production domain to Google Cloud **Authorized JavaScript origins**.
9. Test `/`, `/login`, `/auth/callback`, `/dashboard`,
   `/cyber-range/labs`, and `/verify/test` directly in a new browser tab.

## 5. Optional CLI deployment

After installing the Vercel CLI and completing `vercel login`:

```powershell
npx vercel link
npx vercel env add VITE_SUPABASE_URL production
npx vercel env add VITE_SUPABASE_ANON_KEY production
npx vercel --prod
```

Do not paste secrets into shell history or commit `.env.local`.

## 6. Post-deployment authentication test

Run this checklist against the deployed domain:

1. Open `/login`.
2. Select **CONTINUE WITH GOOGLE**.
3. Complete Google authentication.
4. Confirm return to `/auth/callback`, then `/dashboard`.
5. Refresh and confirm the session remains active.
6. Open a protected Cyber Range lab.
7. Sign out.
8. Reopen `/dashboard` and confirm redirect to `/login`.
9. Sign in again and confirm the original requested route is restored.

Live Cyber Range execution intentionally remains disabled until an isolated
lab provider is configured. The application must show the configuration-required
message instead of claiming that a lab has started.

## 7. Rollback

Use Vercel's deployment list to promote the previous successful deployment.
If authentication fails after a domain change, verify the Supabase redirect
URLs and Google Cloud origins before rolling back application code.
