# Plan

## Reward model (PoUW v2)

- 30-second blocks → 2,880 blocks per day.
- Each block pays one node in each tier, so for one node:
  `FLUX/day = tier reward per block × 2,880 ÷ enabled nodes in that tier`
- Per-block rewards at PoUW v2 launch: Cumulus 1, Nimbus 3.5, Stratus 9, Foundation 0.5 (14 total).
- Reward drops 10% every 1,051,200 blocks; the tier split stays fixed.
- From block 3,071,200 (late Oct 2026): Cumulus 0.9, Nimbus 3.15, Stratus 8.1, Foundation 0.45.
- Rewards are computed from block height, never hardcoded per period.
- Collateral (confirmed): Cumulus 1,000 / Nimbus 12,500 / Stratus 40,000 FLUX.
- Progressive Node Rewards (FluxCloud revenue share) are **out of scope for v1** — no published formula. The UI says so explicitly.

## Architecture

One container on FluxCloud: a small backend that serves the frontend and a cached API.

| Endpoint | Purpose |
|---|---|
| `GET /api/network` | Block height, enabled nodes per tier, current per-block rewards, next reduction height and ETA |
| `GET /api/price` | FLUX price in several fiat currencies, cached server-side |
| `GET /api/lookup/:address` | Nodes for a payment address, last payout, next payout estimate, recent reward history |

- **Stateless:** FluxCloud runs multiple instances; each uses only an in-memory cache.
- **Visitors never call third parties directly** (privacy, rate limits, no keys in the browser).
- **Node IPs are never exposed** in lookup results.

## Price source (decided)

- **CoinGecko Demo (free) plan**, dedicated to this project. Limits: 10,000 calls/month, 100/min; attribution required.
- One `simple/price` call per refresh returns USD, CAD, EUR and GBP together.
- Refresh every **20 minutes per instance**: 3 instances × 72/day × 31 days ≈ 6,700 calls/month, leaving headroom for restarts and extra instances. Interval is configurable.
- API key stored as a FluxCloud environment secret; never sent to the browser.
- On failure, serve the last good price with its timestamp and a "stale" flag.
- "Price data by CoinGecko" attribution in the footer.

## Security requirements

- Non-root user, minimal base image, read-only filesystem.
- Headers: Content-Security-Policy, X-Content-Type-Options, frame-ancestors/X-Frame-Options, Referrer-Policy, Permissions-Policy; no server version disclosure.
- Strict input validation on addresses; per-IP rate limiting on lookup.
- Timeouts, retries with backoff, and stale-cache fallback on every upstream call.
- Pinned dependencies; automated rebuild when the base image updates; dependency and image scanning in CI.

## Build order

1. ~~Verify open questions (see FLUX-API.md) and write reward-math test cases.~~ Done.
2. ~~Backend: network, price, lookup endpoints with caching.~~ Done.
3. ~~Frontend: the three v1 features; A/B comparison and shareable URLs.~~ Done.
4. Check results against Flux's official calculator.
5. Deploy to FluxCloud with Docker (see DEPLOY.md).

## Decisions

- [x] Price source: CoinGecko Demo plan.
- [x] License: MIT.
- [x] Tech stack: TypeScript throughout — React + Vite + Tailwind frontend, Fastify backend, shared reward math.
- [x] Deployment: Docker image on Docker Hub, registered on FluxCloud, standard (all-instances) mode.
- [ ] Domain: after a working version is live on FluxCloud.
