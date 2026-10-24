# Deploying to FluxCloud with Orbit

Orbit (Deploy with Git) runs the `runonflux/orbit` image, which clones this repo, installs dependencies, builds, and starts the app. There is no Docker image to publish.

## Before the first deploy

1. **`release` branch** — Orbit deploys `release`, so work on `main` never goes live by accident. (Created.)
2. **Repo access** — either make the repo public (it's MIT-licensed) so Orbit needs no token, or create a fine-grained token that is **read-only (Contents: Read)** and limited to this repository, and set it as `GIT_TOKEN`.
3. **CoinGecko key** — a Demo API key dedicated to this app.

## Register the app

At [cloud.runonflux.com](https://cloud.runonflux.com) → Register New App → Deploy with Git.

| Setting | Value |
|---|---|
| Component image | `runonflux/orbit:latest` |
| Container port | `8080` |
| External port | any free port the form offers |
| Instances | 3 (standard mode; no `g:` data path) |
| CPU | 1 |
| RAM | 2048 MB (the build needs headroom; the running app uses far less) |
| Storage | 5 GB |

### Environment variables

| Variable | Value | Notes |
|---|---|---|
| `GIT_REPO_URL` | `https://github.com/Dawg4037/flux-node-calculator` | |
| `GIT_BRANCH` | `release` | |
| `APP_PORT` | `8080` | Orbit's health check requests `/` on this port |
| `PORT` | `8080` | What the server listens on |
| `BUILD_COMMAND` | `npm ci --include=dev && npm run build` | Build tools are dev dependencies |
| `RUN_COMMAND` | `npm start` | |
| `POLLING_INTERVAL` | `300` | Checks `release` for new commits every 5 min |
| `COINGECKO_API_KEY` | *(your Demo key)* | Server-side only |
| `PRICE_REFRESH_MINUTES` | `20` | Keeps 3 instances under the 10k calls/month Demo cap |

Node 22 comes from `.nvmrc`. Don't set `NODE_ENV=production` (it would skip the build tools), and don't set `WEBHOOK_SECRET` or expose port 9001 — polling needs nothing open to the public.

Other settings (`NETWORK_REFRESH_SECONDS`, `FLUX_MAX_CONCURRENCY`, `LOOKUP_RATE_PER_MINUTE`, `TRUST_PROXY`) have safe defaults — see `.env.example`.

## After deploying

- First build takes a few minutes (Orbit's limit is 30). Watch the SETUP → BUILD → START stages in the app's logs.
- `https://<app>.app.runonflux.io/api/health` should return `{"ok":true,"network":true,"price":true}` within a minute of starting.
- In the logs, `chain block reward differs from schedule` means the chain's reward no longer matches the coded schedule.

## Releasing an update

```sh
git checkout release
git merge main
git push
```

Orbit picks it up within `POLLING_INTERVAL`, rebuilds, health-checks, and rolls back automatically if anything fails.

## Still to confirm on the first deploy

- Whether Orbit's own install step already includes dev dependencies (if so, `BUILD_COMMAND` can drop `npm ci --include=dev &&`).
- How long a rebuild takes each instance offline, if at all.
