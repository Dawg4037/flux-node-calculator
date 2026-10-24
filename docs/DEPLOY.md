# Deploying to FluxCloud with Docker

The app ships as a Docker image on Docker Hub; FluxCloud pulls and runs it. The image is built from the repo's `Dockerfile`: tests run during the build, and the final image runs as a non-root user with only production dependencies.

## 1. Build and push the image

From the repo root, signed in to Docker Hub (`docker login`). Flux nodes run x86-64, so build for `linux/amd64`:

```sh
docker build --platform linux/amd64 -t <dockerhub-user>/flux-node-calculator:0.1.0 .
docker push <dockerhub-user>/flux-node-calculator:0.1.0
```

Use a new version tag for every release (`0.1.1`, `0.2.0`, …) rather than only `latest`, so each deployment points at an exact build and a rollback is just switching the tag back.

The image must be **public** on Docker Hub. It contains no secrets: the CoinGecko key is supplied at runtime.

## 2. Register the app

At [cloud.runonflux.com](https://cloud.runonflux.com) → Register New App → Deploy with Docker.

| Setting | Value |
|---|---|
| Image | `<dockerhub-user>/flux-node-calculator:0.1.0` |
| Container port | `8080` |
| External port | any free port the form offers |
| Instances | 3 (standard mode; no `g:` data path) |
| CPU | 0.5 |
| RAM | 512 MB |
| Storage | 1 GB |

The app stores nothing on disk and uses ~100 MB of memory, so these minimums are plenty.

### Environment variables

| Variable | Value | Notes |
|---|---|---|
| `COINGECKO_API_KEY` | *(your Demo key)* | Server-side only |
| `PRICE_REFRESH_MINUTES` | `20` | Keeps 3 instances under the 10k calls/month Demo cap |

`PORT` is already `8080` in the image. Other settings (`NETWORK_REFRESH_SECONDS`, `FLUX_MAX_CONCURRENCY`, `LOOKUP_RATE_PER_MINUTE`, `TRUST_PROXY`) have safe defaults — see `.env.example`.

Review the price, sign in Zelcore, and pay.

## 3. Check it

- `https://<app>.app.runonflux.io/api/health` → `{"ok":true,"network":true,"price":true}` within a minute of starting.
- In the logs, `chain block reward differs from schedule` means the chain's reward no longer matches the coded schedule.

## Releasing an update

1. Bump `version` in `package.json`.
2. Build and push with the new tag.
3. In FluxCloud, update the app spec's image to the new tag and sign the update.
4. Merge `main` into `release` so the branch matches what's live.
