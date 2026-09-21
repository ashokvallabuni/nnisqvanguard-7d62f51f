# Environment variables

## Browser build

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

These are the only variables exposed to the browser.

## Server-only

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
LAB_RUNNER_URL=
LAB_RUNNER_SECRET=
DATABASE_URL=
```

Never use `VITE_` for server secrets. Do not commit `.env`, `.env.local`, or
any service-role key.
