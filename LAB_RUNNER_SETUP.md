# Lab runner setup

## Local-ready path

The first provider is Docker and is intentionally server-side. Install Docker
Desktop with the Linux container engine, then from the repository root:

```powershell
docker build -t nisq-linux-security-fundamentals:local lab-runner/docker/linux-security-fundamentals
cd lab-runner
npm install
npm run build
$env:LAB_DOCKER_ENABLED="true"
$env:LAB_DOCKER_IMAGE="nisq-linux-security-fundamentals:local"
$env:LAB_RUNNER_SECRET="use-a-long-random-server-secret"
npm start
```

The runner binds to `127.0.0.1` by default. It creates containers with
`--network none`, a non-root `student` user, dropped capabilities,
`no-new-privileges`, CPU/memory/PID limits, read-only root storage, and
ephemeral tmpfs workspaces. It never mounts a host path or Docker socket.

The current Windows environment did not have a running Docker daemon when this
was implemented, so image build and end-to-end container verification remain
blocked until Docker Desktop is started.

## Production

Run the service on dedicated backend infrastructure, not Vercel or Netlify.
Put an authenticated application gateway in front of it. The gateway must
validate Supabase JWTs and send only trusted user/session context to the
runner. Keep `LAB_RUNNER_SECRET`, `LAB_DOCKER_ENABLED`, and Docker credentials
server-side.
