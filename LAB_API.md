# Lab API boundary

The separate runner contract is documented in
[`lab-runner/README.md`](./lab-runner/README.md).

```text
GET  /health
POST /api/labs/:labId/session
POST /api/labs/:labId/session/:sessionId/start
POST /api/labs/:labId/session/:sessionId/terminal
POST /api/labs/:labId/session/:sessionId/reset
POST /api/labs/:labId/session/:sessionId/stop
POST /api/labs/:labId/session/:sessionId/submit
GET  /api/labs/:labId/session/:sessionId/status
```

The current service returns `LAB_INFRASTRUCTURE_NOT_CONFIGURED` for execution
operations. It does not expose arbitrary command execution. Before production
enablement, every request must validate the authenticated user, session
ownership, lab/task ownership, input schema, expiration, rate limits, and
authorization.
