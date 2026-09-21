# Lab security boundary

Cyber Labs are authorized training environments only:

> These laboratories are intentionally isolated training environments. Test
> only systems for which you have explicit authorization.

The current runner is **NOT CONFIGURED**. It cannot execute commands and does
not expose terminal output.

Before enabling a provider, the implementation must include:

- authenticated request verification and session ownership checks
- signed, short-lived orchestration jobs
- non-root containers or locked-down VMs
- no `--privileged`, Docker socket, or host filesystem mounts
- no service-role keys or production network routes
- default network mode `none`
- CPU, memory, disk, process, and wall-clock limits
- automatic expiry, destruction, and cleanup
- rate limiting and audit events for submissions
- tests proving expired/stopped sessions cannot execute

Never use this platform for credential theft, malware deployment, unauthorized
scanning, persistence, phishing, or attacks against third-party systems.
