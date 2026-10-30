/**
 * Facts for the "Run a node" tab. Requirements change with FluxOS releases, so they live here
 * in one place with the date they were last checked against Flux's docs and FAQ.
 */
import type { Tier } from "../../shared/rewards.ts";

/** Year-month the requirements and links below were last checked. */
export const GUIDE_CHECKED = "2026-10";

export interface TierHardware {
  cores: number;
  threads: number;
  ramGb: number;
  ssdGb: number;
  /** Minimum benchmark score (events per second, FluxBench). */
  eps: number;
  mbps: number;
  /** Minimum disk write speed, MB/s. */
  diskMBs: number;
}

/** From docs.runonflux.com "What are FluxNodes" and the Flux FAQ (Oct 2026). */
export const TIER_HARDWARE: Record<Tier, TierHardware> = {
  cumulus: { cores: 2, threads: 4, ramGb: 8, ssdGb: 220, eps: 240, mbps: 25, diskMBs: 180 },
  nimbus: { cores: 4, threads: 8, ramGb: 32, ssdGb: 440, eps: 640, mbps: 50, diskMBs: 180 },
  stratus: { cores: 8, threads: 16, ramGb: 64, ssdGb: 880, eps: 1520, mbps: 100, diskMBs: 400 },
};

const DOCS = "https://docs.runonflux.com/fluxnodes";

/** Official guides. */
export const LINKS = {
  whatAreNodes: `${DOCS}/what-are-fluxnodes`,
  arcaneOs: `${DOCS}/arcaneos-fluxnode/how-to-install-arcane-os`,
  arcaneOsSteps: `${DOCS}/arcaneos-fluxnode/step-by-step-guide/`,
  legacy: `${DOCS}/legacy-fluxnode/`,
  startSsp: `${DOCS}/legacy-fluxnode/step-by-step-guide/step-4-start-your-fluxnode/start-via-ssp`,
  startZelcore: `${DOCS}/legacy-fluxnode/step-by-step-guide/step-4-start-your-fluxnode/start-via-zelcore`,
  diagnosing: `${DOCS}/legacy-fluxnode/diagnosing-issues`,
  titan: `${DOCS}/titan-node-staking`,
  managed: `${DOCS}/managed-fluxnode-service`,
  unlock: `${DOCS}/unlocking-fluxnode-collateral`,
  sspWallet: "https://sspwallet.io/",
  zelcore: "https://zelcore.io/",
  buyFlux: "https://coinmarketcap.com/currencies/zel/",
  /** Flux's own walkthrough. */
  guide2026: "https://runonflux.com/how-to-run-a-fluxnode-2026",
  /** Community-run marketplace matching collateral holders with operators who have spare hardware. */
  fluxHub: "https://fluxhub.moltentech.us/",
} as const;
