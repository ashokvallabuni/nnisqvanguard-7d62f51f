# NISQ Cyber Lab Runner

This is a separate orchestration boundary for future isolated lab execution.
It is deliberately disabled until a reviewed container/VM provider is
configured. The service does not expose arbitrary shell execution and binds to
`127.0.0.1` by default.

## Configuration

Server-only variables:

```text
PORT=8787
LAB_RUNNER_ENABLED=false
LAB_RUNNER_SECRET=
```

When disabled or missing its secret, mutating routes return
`LAB_INFRASTRUCTURE_NOT_CONFIGURED`. The frontend must show a controlled
configuration state rather than terminal output.

## Contract

```text
GET  /health
POST /api/labs/:labId/session
POST /api/labs/:labId/session/:sessionId/start
POST /api/labs/:labId/session/:sessionId/reset
POST /api/labs/:labId/session/:sessionId/stop
POST /api/labs/:labId/session/:sessionId/submit
GET  /api/labs/:labId/session/:sessionId/status
```

All non-health routes require the server-to-server `x-lab-runner-secret`
header. A production adapter must add authenticated Supabase JWT validation,
session ownership checks, signed job requests, queue persistence, rate limits,
and a provider that enforces non-root containers, no privileged mode, no host
mounts, no Docker socket, no production credentials, network isolation,
resource limits, timeouts, and cleanup.

This service is not a production runner yet. Do not deploy it as an execution
backend until those controls and integration tests are implemented.
