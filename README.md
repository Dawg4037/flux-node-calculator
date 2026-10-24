# Flux Node Calculator

A public FluxNode reward calculator, hosted on FluxCloud.

**Status:** planning. No code yet.

## Version 1 features

- **Node Lookup** — enter a payment address to see your nodes, tier, last payout, estimated next payout, and actual vs. projected earnings.
- **Multi-year projections** — earnings across the scheduled 10% block-reward reductions, with node-count and FLUX price scenarios.
- **ROI and break-even** — collateral cost, hosting, and power in; net monthly profit, break-even time, and APR out. Compare tier mixes side by side.

## Docs

- [Plan](docs/PLAN.md) — architecture, security requirements, build order
- [Flux API notes](docs/FLUX-API.md) — endpoints we use and open questions

## Background

Inspired by [`jefke/flux-calculator`](https://hub.docker.com/r/jefke/flux-calculator) (built August 2025). That app's reward constants predate PoUW v2 and now overstate earnings, and its container is unhardened, so this is a from-scratch rewrite rather than a fork.
