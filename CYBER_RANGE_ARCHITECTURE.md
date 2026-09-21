# NISQ Cyber Range architecture

The website is the authenticated control plane. It reads published catalog
records and never executes commands in React, Supabase, Vercel, or Netlify.

```text
Browser
  -> Supabase Auth
  -> authenticated application/API boundary
  -> lab orchestrator
  -> isolated ephemeral provider
  -> session/task result records in Supabase
```

The database migration `20260921040000_cyber_lab_runtime.sql` adds the
persistence boundary for session events, task and flag attempts, environment
templates, runner jobs and instances, skills, badges, and CTF foundations.

The separate `lab-runner` process is currently a guarded contract service. It
returns `LAB_INFRASTRUCTURE_NOT_CONFIGURED` until a reviewed provider adapter
is implemented. No shell or arbitrary command endpoint exists.

Production execution must enforce non-root containers, no privileged mode, no
host mounts or Docker socket, no production credentials, no default internet
access, CPU/memory/disk/time limits, ephemeral workspaces, and cleanup.
