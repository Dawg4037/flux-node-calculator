# Deploying to FluxCloud with Orbit

Orbit (Deploy with Git) clones this repo, builds it, and runs it — no Docker image to publish.

## Before the first deploy

1. Create a `release` branch from `main`. Orbit deploys `release`, so work on `main` never goes live by accident.
2. Make the repo public (it's MIT-licensed), so Orbit needs no `GIT_TOKEN`. If it must stay private, use a fine-grained token that is **read-only** and limited to this repository.
3. Create a CoinGecko Demo API key dedicated to this app.

## Environment variables

| Variable | Value | Notes |
|---|---|---|
| `GIT_REPO_URL` | `https://github.com/Dawg4037/flux-node-calculator` | |
| `GIT_BRANCH` | `release` | |
| `NODE_VERSION` | `22` | |
| `BUILD_COMMAND` | `npm ci --include=dev && npm run build` | Build tools are dev dependencies |
| `RUN_COMMAND` | `npm start` | |
| `APP_PORT` | `8080` | Must match the app's port in FluxCloud |
| `PORT` | `8080` | What the server listens on |
| `POLLING_INTERVAL` | `300` | Check `release` for new commits every 5 min |
| `COINGECKO_API_KEY` | *(your Demo key)* | Server-side only |
| `PRICE_REFRESH_MINUTES` | `20` | Keeps 3 instances under the 10k calls/month Demo cap |

Leave `WEBHOOK_SECRET` unset and don't expose port 9001: polling needs nothing open to the public.

Other settings (`NETWORK_REFRESH_SECONDS`, `FLUX_MAX_CONCURRENCY`, `LOOKUP_RATE_PER_MINUTE`, `TRUST_PROXY`) have safe defaults — see `.env.example`.

## Instances

Standard mode (all instances serving) is recommended: the app stores nothing, and failover is instant. Don't add a `g:` data path.

## After deploying

- `https://<app>.app.runonflux.io/api/health` should return `{"ok":true,"network":true,"price":true}` within a minute.
- Check the logs for `chain block reward differs from schedule` — it means the chain's reward no longer matches the coded schedule.

## Releasing an update

Merge `main` into `release` and push. Orbit picks it up within `POLLING_INTERVAL`, rebuilds, and rolls back automatically if the build fails.

## To verify on the first deploy

- That Orbit runs `BUILD_COMMAND` with dev dependencies available.
- How long an Orbit rebuild takes the site offline, if at all.
