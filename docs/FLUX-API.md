# Flux API notes

Source: Flux API spec v8.20.0 (https://docs.runonflux.io/fluxapi/description/introduction), checked against live responses from `api.runonflux.io` on 2026-10-23 (height 3,063,554).

Base URL: `https://api.runonflux.io` (load-balanced gateway). All endpoints below are public.

**Every response must be checked for `status === "success"`** — errors come back with HTTP 200.

## Network

| Endpoint | Live behaviour |
|---|---|
| `GET /daemon/getblockcount` | `data` is the height (integer). |
| `GET /daemon/getfluxnodecount` | Returns both `cumulus-/nimbus-/stratus-enabled` and the legacy `basic-/super-/bamf-enabled` (same values). Live: 3,333 / 1,663 / 1,836. |
| `GET /daemon/getblocksubsidy?height=` | `data.miner` is the **total** block reward across tiers + Foundation. Verified schedule: 37.5 before 2,020,000; 14 from 2,020,000; 12.6 from 3,071,200; 11.34 from 4,122,400; … 5.42388684 from 11,480,800 (each step truncated to whole satoshis). |
| `GET /daemon/getblockchaininfo` | `upgrades` shows "PON" (Proof of Node) activated at 2,020,000 — the schedule's start. |

Measured block time: 30.01 s average over 2,880 blocks.

## Node lookup

| Endpoint | Live behaviour |
|---|---|
| `GET /daemon/viewdeterministicfluxnodelist?filter=<payment address>` | Fields: `collateral`, `txhash`, `outidx`, `ip`, `network`, `added_height`, `confirmed_height`, `last_confirmed_height`, `last_paid_height`, `tier` (`CUMULUS`/`NIMBUS`/`STRATUS`), `payment_address`, `pubkey`, `activesince`, `lastpaid`, `amount` (e.g. `"40000.00"`), `rank`. **`filter` is a substring match** — 7 characters matched 223 nodes — so validate the full address and keep only exact `payment_address` matches. |
| `GET /daemon/viewdeterministicfluxnodelist` (unfiltered) | 6,832 nodes, ~4.2 MB, ~1.2 s. Avoid per request. |
| `GET /daemon/getaddressdeltas?address=&start=&end=` | Array of `{address, blockindex, height, index, satoshis, txid}`. Node rewards have **`blockindex: 0`** (coinbase) and `satoshis` equal to the tier's per-block reward (e.g. 900,000,000 for Stratus at 14 FLUX/block). |
| `GET /daemon/fluxnodecurrentwinner` | Current winner per tier; the winner is `rank: 0` in the list. |
| `GET /daemon/getdoslist` | Nodes on the DOS list (not paid). Fields: `collateral`, `added_height`, `payment_address`, `eligible_in` (blocks until it can be started again), `amount`. No tier field: tier comes from `amount`. ~8 entries (Oct 2026). |
| `GET /daemon/getstartlist` | Nodes started but not yet confirmed. Fields: `collateral`, `added_height`, `payment_address`, `expires_in` (blocks left to confirm), `amount`. ~1 entry (Oct 2026). |

Both lists are small, so the server fetches them with each network refresh and filters by exact payment address per lookup. DOS and starting nodes are not in the confirmed list. Per the project owner, a node lands on the DOS list for one of two reasons: incorrect collateral information, or the daemon not being synced.

`rank` is the position **within the tier's payment queue**: rank 0 is paid next, and `last_paid_height` rises by one per rank. Next payout ≈ `(rank + 1) × 30 s`.

## Rate limits (from Flux community, Oct 2026)

- FluxOS has no blanket requests-per-second limit; some individual endpoints have their own limits.
- Standard daemon RPC calls are capped at **5 concurrent calls** per node through FluxOS.
- `api.runonflux.io` sits behind a load balancer; whether the gateway adds its own limits is unconfirmed.

Implemented response:

- At most 2 concurrent upstream calls per instance (`FLUX_MAX_CONCURRENCY`), bounded queue, 503 when full.
- Network data refreshed every 90 s and shared by all visitors.
- Lookups cached per address for 60 s; 10 lookups per visitor per minute.
- Timeouts on every call, one retry with backoff on network errors/429/5xx, stale data served if a refresh fails.

## Open questions

- [x] `getblocksubsidy` shape — total reward in `data.miner`.
- [x] Meaning of `rank` — per-tier queue position.
- [x] `getfluxnodecount` field names — both tier and legacy names present.
- [x] Separating rewards from transfers — `blockindex: 0` plus amount match.
- [ ] Whether the gateway applies its own rate limits.
- [ ] Exact satoshi rounding of the tier split at later reductions (affects only the 8th decimal).

## Not provided by Flux

- FLUX market price → CoinGecko, coin id `zelcash` (verified).
