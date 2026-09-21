# NISQ Vanguard authentication setup

The frontend uses Supabase Auth with the Google provider. No Google secret or
service-role key belongs in this repository.

## Frontend environment variables

Create `.env.local` in the repository root:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Find both values in **Supabase → Project Settings → API**:

- `VITE_SUPABASE_URL`: Project URL
- `VITE_SUPABASE_ANON_KEY`: publishable key or legacy anon public key

Never put a `service_role` key, Google client secret, database password, or
private token in `.env.local`, Vercel, or frontend code.

## Database migration

In **Supabase → SQL Editor**, create a new query and run the complete contents
of:

```text
supabase/migrations/20260921000000_auth_profiles_roles.sql
```

Verify the migration:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'user_roles');
```

Both tables should return `rowsecurity = true`.

## Supabase

1. In the Supabase dashboard, open **Authentication → Providers → Google**.
2. Enable Google and paste the Google OAuth **Client ID** and **Client Secret**
   created in Google Cloud.
3. Set the Supabase callback URL shown by the provider configuration as the
   Google Cloud **Authorized redirect URI**. It normally has this form:
   `https://<project-ref>.supabase.co/auth/v1/callback`.
4. In **Authentication → URL Configuration**, set the production **Site URL**
   to your deployed origin and add these redirect URLs:
   `http://localhost:5173/auth/callback` and
   `https://your-production-domain.example/auth/callback`.
   Replace the local port if Vite reports a different one.

## Google Cloud

Create an OAuth 2.0 Web application client. Configure:

- **Authorized JavaScript origins**: the local development origin and the
  production origin, such as `http://localhost:5173` and
  `https://your-production-domain.example`.
- **Authorized redirect URI**: the Supabase callback URL from the provider
  settings, not the frontend callback route.

Use the real Client ID and Client Secret only in the Supabase dashboard.
Never commit them or put the Client Secret in Vite environment variables.

## Frontend environment

Copy `.env.example` to `.env.local` and provide the Supabase project URL and
publishable/anonymous key. The frontend accepts only `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as the documented configuration.

## Optional first administrator

After signing in once, assign a trusted account an application role from
Supabase SQL Editor. Replace the email before running:

```sql
insert into public.user_roles (user_id, role)
select id, 'SUPER_ADMIN'
from auth.users
where email = 'your-email@example.com'
on conflict (user_id, role) do nothing;
```
