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
| `COINGECKO_API_KEY` | *(your Demo key)* | Optional. Only used when the Flux explorer price is unavailable. Server-side only |
| `PRICE_REFRESH_MINUTES` | `20` | How often the price is refreshed |

Names are case-sensitive: `coingecko_api_key` is not read.

The price comes from the Flux explorer (`EXPLORER_URLS`, default `https://explorer.runonflux.io,https://explorer.app.runonflux.io`) in USD, converted with the ECB's daily rates from Frankfurter (`FRANKFURTER_BASE_URL`). CoinGecko is the fallback. None of these need changing.

`PORT` is already `8080` in the image. Other settings (`NETWORK_REFRESH_SECONDS`, `FLUX_MAX_CONCURRENCY`, `LOOKUP_RATE_PER_MINUTE`, `TRUST_PROXY`) have safe defaults — see `.env.example`.

Review the price, sign in Zelcore, and pay.

## 3. Check it

- `https://<app>.app.runonflux.io/api/health` → `"network":true` and `"price":true` within a minute of starting, plus the `version` that instance runs.
  `priceSource.source` shows where the price came from (`Flux explorer` or `CoinGecko`), and `priceSource.errors` the last error from each source. If `price` is false, `priceSource.lastError` says why (e.g. `explorer: HTTP 503; coingecko: timeout`), and `priceSource.keySet` shows whether `COINGECKO_API_KEY` reached the container. After a failed price refresh the server retries in 2, 4, 8 and 16 minutes, then every 20.
- In the logs, `chain block reward differs from schedule` means the chain's reward no longer matches the coded schedule.

## Releasing an update

Images are built and pushed by GitHub Actions (`.github/workflows/docker-publish.yml`) whenever `release` is updated. The image tag comes from `version` in `package.json`, and an existing version is never overwritten.

1. Bump `version` in `package.json` on `main` (e.g. `0.1.1` → `0.1.2`) and commit.
2. Merge `main` into `release` and push:
   ```sh
   git checkout release
   git merge main
   git push
   git checkout main
   ```
3. Wait for the **Publish Docker image** run under the repo's Actions tab to finish (about 2–4 minutes). It runs the tests first; a failure stops the publish.
4. In FluxCloud: Manage → Subscription → Update → set the image to the new tag, turn Renewal off, and sign.

Rollback: set the image back to the previous tag in step 4.

### One-time setup for the workflow

Add two repository secrets under Settings → Secrets and variables → Actions:

- `DOCKERHUB_USERNAME`: `dawg4037`
- `DOCKERHUB_TOKEN`: a Docker Hub access token (Docker Hub → Account settings → Personal access tokens) with **Read & Write** scope only.

To publish without pushing to `release` (e.g. to retry), use Actions → Publish Docker image → Run workflow.
