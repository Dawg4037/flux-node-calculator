/** Response shapes for the app's own API (/api/*). Shared by server and browser. */
import type { PerTier, Tier } from "./rewards.ts";

export const CURRENCIES = ["usd", "eur", "gbp", "cad", "idr"] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface NetworkResponse {
  height: number;
  /** Enabled nodes per tier. */
  nodes: PerTier<number>;
  /** FLUX paid to each tier's winner per block at the current height. */
  rewardPerBlock: PerTier<number>;
  /** Total per-block reward computed from the schedule. */
  totalBlockReward: number;
  /** Total per-block reward reported by the chain (getblocksubsidy), for cross-checking. */
  chainBlockReward: number | null;
  nextReductionHeight: number;
  blocksToNextReduction: number;
  /** Estimated time of the next reduction (ISO 8601). */
  nextReductionEta: string;
  /** When this data was fetched from Flux (ISO 8601). */
  updatedAt: string;
  /** True when the latest refresh failed and older data is being served. */
  stale: boolean;
}

export interface PriceResponse {
  prices: Record<Currency, number>;
  /** When CoinGecko last updated the price (ISO 8601), or null if unknown. */
  updatedAt: string | null;
  stale: boolean;
  source: "CoinGecko";
}

export interface LookupNode {
  tier: Tier;
  collateralFlux: number;
  /** Shortened collateral transaction id, to tell nodes apart. */
  collateralRef: string;
  /** Position in the tier's payment queue (0 = paid next). */
  rank: number;
  queueSize: number;
  nextPayoutBlocks: number;
  nextPayoutEta: string;
  lastPaidHeight: number | null;
  lastPaidAt: string | null;
  confirmedHeight: number;
  activeSince: string | null;
  expectedDailyFlux: number;
}

export interface LookupHistory {
  days: number;
  fromHeight: number;
  toHeight: number;
  payments: number;
  flux: number;
  fluxByTier: PerTier<number>;
  /** What the address's nodes were expected to earn over the same window. */
  projectedFlux: number;
}

/** A node on Flux's DOS list: not paid until it's restarted. */
export interface DosNode {
  tier: Tier;
  collateralRef: string;
  /** Blocks until it can be started again (0 = now). */
  eligibleInBlocks: number;
  eligibleAt: string;
}

/** A node that has been started but isn't confirmed yet. */
export interface StartingNode {
  tier: Tier;
  collateralRef: string;
  /** Blocks left to confirm before the start lapses. */
  expiresInBlocks: number;
  expiresAt: string;
}

export interface LookupResponse {
  address: string;
  height: number;
  /** Confirmed nodes (being paid). */
  nodes: LookupNode[];
  /** Nodes on the DOS list. Null if the list couldn't be loaded. */
  dosNodes: DosNode[] | null;
  /** Nodes started but not yet confirmed. Null if the list couldn't be loaded. */
  startingNodes: StartingNode[] | null;
  totals: {
    nodes: PerTier<number>;
    collateralFlux: number;
    expectedDailyFlux: number;
  };
  /** Null when history could not be loaded. */
  history: LookupHistory | null;
  updatedAt: string;
}

export interface ApiError {
  error: string;
}
