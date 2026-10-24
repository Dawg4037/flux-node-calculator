# Flux API notes

Source: Flux API spec v8.20.0 (https://docs.runonflux.io/fluxapi/description/introduction).

Base URL: `https://api.runonflux.io` (load-balanced gateway). All endpoints below are public.

**Every response must be checked for `status === "success"`** — errors come back with HTTP 200.

## Network

| Endpoint | Use |
|---|---|
| `GET /daemon/getblockcount` | Current height (drives reward schedule) |
| `GET /daemon/getfluxnodecount` | Enabled nodes per tier. Legacy field names: `basic-enabled` = Cumulus, `super-enabled` = Nimbus, `bamf-enabled` = Stratus |
| `GET /daemon/getblocksubsidy?height=` | Block reward at a height. Documented response shows only `miner`; must confirm whether it reflects PoUW v2 tier amounts |

## Node lookup

| Endpoint | Use |
|---|---|
| `GET /daemon/viewdeterministicfluxnodelist?filter=<payment address>` | Nodes for an address: `tier`, `amount`, `rank`, `last_paid_height`, `lastpaid`, `confirmed_height`, `last_confirmed_height`, `activesince`, `ip` (never exposed) |
| `GET /daemon/getaddressdeltas?address=&start=&end=` | Balance changes in a height range; filter to reward payments for actual-earnings history |

Next-payout estimate: `rank × 30 s`, if `rank` is the position within the node's tier.

## Rate limits (from Flux community, Oct 2026)

- FluxOS has no blanket requests-per-second limit; some individual endpoints have their own limits.
- Standard daemon RPC calls are capped at **5 concurrent calls** per node through FluxOS.
- `api.runonflux.io` sits behind a load balancer; whether the gateway adds its own limits is unconfirmed.

Design response:

- Never more than 2 concurrent upstream calls per instance (queue the rest).
- Network data (height, node counts) refreshed every 60–120 s and shared by all visitors.
- Lookup results cached per address for 60 s; per-IP rate limit on lookups.
- Retries with backoff on errors or 429s; serve stale cache if the gateway is unavailable.
- Direct node IPs as a fallback are possible but out of scope for v1.

## Open questions

- [ ] Current `getblocksubsidy` response shape after PoUW v2.
- [ ] Meaning of `rank` (per tier or global).
- [ ] Live `getfluxnodecount` field names (legacy vs. tier names).
- [ ] Whether the gateway applies its own rate limits.
- [ ] Reliable way to separate reward payments from other transfers in address deltas.

## Not provided by Flux

- FLUX market price → CoinGecko (see PLAN.md).
