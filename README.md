# Flux Node Calculator

A public FluxNode reward calculator, hosted on FluxCloud.

- **Earnings and ROI** — nodes and running costs in; FLUX per day/month/year, net profit, yearly reward rate, and break-even out. Compare two setups side by side.
- **Projections** — month-by-month earnings across the scheduled 10% reward reductions, with network-size and low/middle/high price assumptions.
- **Node lookup** — enter a payment address to see your nodes, queue position, next and last payout, and the last 30 days of rewards received vs. expected.

Every setup is stored in the URL, so a calculation can be shared as a link.

## How rewards are calculated

Verified against the live chain (October 2026):

- 30-second blocks; each block pays one node in each tier.
- Total block reward is 14 FLUX from block 2,020,000, dropping 10% every 1,051,200 blocks (12.6 from block 3,071,200).
- Split: Cumulus 1/14, Nimbus 3.5/14, Stratus 9/14, Foundation 0.5/14.
- One node earns `tier reward per block × 2,880 ÷ enabled nodes in its tier` per day.
- Collateral: Cumulus 1,000 / Nimbus 12,500 / Stratus 40,000 FLUX.

**Parallel assets are included by default.** Each active parallel asset (9 as of October 2026: Kadena, Ethereum, BSC, Tron, Solana, Avalanche, Algorand, Polygon, Base) pays an extra 10% of every node payout on its own chain. They must be claimed manually in Zelcore (Apps → Fusion → Parallel Mining Claim), each claim costs a network fee, and Flux projects them running out around 2028. The calculator stops them on a configurable end date (default January 1, 2028) and warns that the real end will likely be earlier. Visitors can change the number of active assets, their value relative to native FLUX, and the end date, or switch them off.

Progressive Node Rewards (FluxCloud revenue share) are not included: no formula has been published.

## Running locally

Requires Node 22+.

```sh
npm install
npm test            # reward math + API tests
npm run build
npm start           # http://localhost:8080
```

Offline, with a stand-in for the Flux API and CoinGecko:

```sh
node scripts/mock-upstream.mjs &
FLUX_API_BASE_URL=http://127.0.0.1:9999 COINGECKO_BASE_URL=http://127.0.0.1:9999/cg npm start
```

For frontend work, run `npm start` (or the mock setup) and `npm run dev` together; Vite proxies `/api` to port 8080.

Configuration is via environment variables — see [`.env.example`](.env.example).

## Project layout

```
shared/   reward math and API types (used by server and browser)
server/   Fastify backend: /api/network, /api/price, /api/lookup/:address
web/      React + Vite + Tailwind frontend
tests/    Vitest tests
```

## Security

- The browser only talks to this server. Flux and CoinGecko are called server-side, cached, and shared by all visitors; the CoinGecko key never reaches the browser.
- Strict Content-Security-Policy (`'self'` only), no framing, nosniff, strict referrer policy, permissions policy.
- Lookup addresses are validated exactly (the Flux API substring-matches), results are filtered to exact matches, node IPs and public keys are never returned, and lookups are rate-limited per visitor and redacted from logs.
- At most 2 concurrent Flux API calls per instance (FluxOS caps daemon RPC at 5), with timeouts, retry with backoff, and stale-data fallback.

## Docs

- [Deploying to FluxCloud](docs/DEPLOY.md)
- [Plan](docs/PLAN.md)
- [Flux API notes](docs/FLUX-API.md)

## License

[MIT](LICENSE)
