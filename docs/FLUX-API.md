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

## Open questions

- [ ] Current `getblocksubsidy` response shape after PoUW v2.
- [ ] Meaning of `rank` (per tier or global).
- [ ] Live `getfluxnodecount` field names (legacy vs. tier names).
- [ ] Gateway rate limits (user checking with Flux).
- [ ] Reliable way to separate reward payments from other transfers in address deltas.

## Not provided by Flux

- FLUX market price → external source (see PLAN.md).
