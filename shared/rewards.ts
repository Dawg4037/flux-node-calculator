/**
 * Flux PoUW v2 reward math. Pure functions, shared by the server and the browser.
 *
 * Verified against the live chain (api.runonflux.io, Oct 2026):
 * - getblocksubsidy returns the TOTAL per-block reward: 37.5 before block 2,020,000,
 *   then 14, dropping 10% every 1,051,200 blocks (12.6 at 3,071,200; 11.34 at 4,122,400;
 *   5.42388684 at 11,480,800 — each step truncated to whole satoshis).
 * - Each block pays one node per tier. Split of the total: Cumulus 1/14, Nimbus 3.5/14,
 *   Stratus 9/14, Foundation 0.5/14 (a Stratus payout at 14 FLUX/block is exactly 9 FLUX).
 * - Blocks average 30 seconds (measured 30.01 s over 2,880 blocks).
 */

export const TIERS = ["cumulus", "nimbus", "stratus"] as const;
export type Tier = (typeof TIERS)[number];
export type PerTier<T> = Record<Tier, T>;

export const TIER_LABEL: PerTier<string> = {
  cumulus: "Cumulus",
  nimbus: "Nimbus",
  stratus: "Stratus",
};

/** Collateral locked per node, in FLUX. */
export const COLLATERAL: PerTier<number> = {
  cumulus: 1_000,
  nimbus: 12_500,
  stratus: 40_000,
};

export const SAT_PER_FLUX = 100_000_000;
export const BLOCK_TIME_SECONDS = 30;
export const BLOCKS_PER_DAY = 2_880;
export const DAYS_PER_MONTH = 365.25 / 12;
/** 87,660 blocks. */
export const BLOCKS_PER_MONTH = BLOCKS_PER_DAY * DAYS_PER_MONTH;
export const BLOCKS_PER_YEAR = BLOCKS_PER_MONTH * 12;

/** First block of the 14 FLUX schedule ("PON" upgrade activation height). */
export const SCHEDULE_START_HEIGHT = 2_020_000;
export const REDUCTION_INTERVAL = 1_051_200;
export const INITIAL_BLOCK_REWARD_SAT = 14 * SAT_PER_FLUX;

/** Tier shares of the total block reward, in 28ths (Foundation takes the remaining 1/28). */
const SHARE_OF_28: PerTier<number> = { cumulus: 2, nimbus: 7, stratus: 18 };

/** Number of 10% reductions applied at a height. Heights before the schedule count as 0. */
export function reductionIndex(height: number): number {
  if (!Number.isFinite(height) || height < SCHEDULE_START_HEIGHT) return 0;
  return Math.floor((height - SCHEDULE_START_HEIGHT) / REDUCTION_INTERVAL);
}

/** Height at which the next reduction takes effect. */
export function nextReductionHeight(height: number): number {
  return SCHEDULE_START_HEIGHT + (reductionIndex(height) + 1) * REDUCTION_INTERVAL;
}

/** Total block reward (all tiers + Foundation) at a height, in satoshis. */
export function totalBlockRewardSat(height: number): number {
  let sat = INITIAL_BLOCK_REWARD_SAT;
  const k = reductionIndex(height);
  for (let i = 0; i < k; i++) sat = Math.floor((sat * 9) / 10);
  return sat;
}

/** Reward paid to the winning node of a tier for one block, in satoshis. */
export function tierBlockRewardSat(tier: Tier, height: number): number {
  return Math.floor((totalBlockRewardSat(height) * SHARE_OF_28[tier]) / 28);
}

/** Reward paid to the winning node of a tier for one block, in FLUX. */
export function tierBlockReward(tier: Tier, height: number): number {
  return tierBlockRewardSat(tier, height) / SAT_PER_FLUX;
}

/**
 * Total FLUX a tier pays out over `blocks` blocks starting at `fromHeight`,
 * honouring any reductions inside the range. `blocks` may be fractional.
 */
export function tierPayoutForRange(tier: Tier, fromHeight: number, blocks: number): number {
  let remaining = Math.max(0, blocks);
  let h = fromHeight;
  let total = 0;
  while (remaining > 0) {
    const boundary = nextReductionHeight(h);
    const span = Math.min(remaining, boundary - h);
    total += tierBlockReward(tier, h) * span;
    remaining -= span;
    h += span;
  }
  return total;
}

/** One node's expected FLUX per day at a height, given enabled nodes in its tier. */
export function dailyFluxPerNode(tier: Tier, height: number, enabledInTier: number): number {
  if (!(enabledInTier > 0)) return 0;
  return (tierBlockReward(tier, height) * BLOCKS_PER_DAY) / enabledInTier;
}

// ---------------------------------------------------------------------------
// Projections and ROI
// ---------------------------------------------------------------------------

export interface ProjectionInput {
  /** Block height the projection starts from (normally the current height). */
  startHeight: number;
  /** Projection length in months (1–240). */
  months: number;
  /** Nodes you run per tier. */
  yourNodes: PerTier<number>;
  /** Enabled nodes per tier on the network today. */
  networkNodes: PerTier<number>;
  /** Annual % change in network node count (e.g. -10 for 10% fewer nodes per year). */
  networkGrowthPctPerYear: number;
  /** FLUX price today, in the display currency. */
  startPrice: number;
  /** Annual % change in FLUX price. */
  priceChangePctPerYear: number;
  /** Running cost per node per month (hosting, power), in the display currency. */
  monthlyCostPerNode: PerTier<number>;
  /** One-time setup cost (hardware, etc.), in the display currency. */
  upfrontCost: number;
  /** Price paid per FLUX for collateral, in the display currency. */
  collateralPrice: number;
  /** Count the collateral purchase as capital to recover in break-even. */
  includeCollateralInBreakEven: boolean;
}

export interface ProjectionMonth {
  month: number; // 1-based
  startHeight: number;
  flux: PerTier<number>;
  fluxTotal: number;
  price: number;
  revenue: number;
  cost: number;
  net: number;
  cumulativeFlux: number;
  cumulativeNet: number;
}

export interface ProjectionResult {
  months: ProjectionMonth[];
  collateralFlux: number;
  capital: number;
  /** First month in which cumulative net profit covers the capital; null if not within the horizon. */
  breakEvenMonth: number | null;
  totalFlux: number;
  totalNet: number;
}

const clamp = (n: number, lo: number, hi: number) =>
  Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;

export function collateralFlux(yourNodes: PerTier<number>): number {
  return TIERS.reduce((sum, t) => sum + Math.max(0, yourNodes[t]) * COLLATERAL[t], 0);
}

/**
 * Month-by-month projection. Network size and price compound monthly from their
 * annual rates and are evaluated at mid-month. The tier's node count is never
 * taken as smaller than your own node count.
 */
export function project(input: ProjectionInput): ProjectionResult {
  const months = Math.round(clamp(input.months, 1, 240));
  const growth = clamp(input.networkGrowthPctPerYear, -99, 1000) / 100;
  const priceChange = clamp(input.priceChangePctPerYear, -99, 10000) / 100;
  const startPrice = clamp(input.startPrice, 0, 1e9);

  const yours: PerTier<number> = {
    cumulus: Math.max(0, Math.floor(input.yourNodes.cumulus)),
    nimbus: Math.max(0, Math.floor(input.yourNodes.nimbus)),
    stratus: Math.max(0, Math.floor(input.yourNodes.stratus)),
  };

  const collFlux = collateralFlux(yours);
  const capital =
    Math.max(0, input.upfrontCost || 0) +
    (input.includeCollateralInBreakEven ? collFlux * Math.max(0, input.collateralPrice || 0) : 0);

  const monthlyCost = TIERS.reduce(
    (sum, t) => sum + yours[t] * Math.max(0, input.monthlyCostPerNode[t] || 0),
    0,
  );

  const out: ProjectionMonth[] = [];
  let cumulativeFlux = 0;
  let cumulativeNet = 0;
  let breakEvenMonth: number | null = null;

  for (let m = 0; m < months; m++) {
    const startHeight = input.startHeight + m * BLOCKS_PER_MONTH;
    const yearsMid = (m + 0.5) / 12;
    const flux = { cumulus: 0, nimbus: 0, stratus: 0 } as PerTier<number>;

    for (const t of TIERS) {
      if (yours[t] === 0) continue;
      const network = Math.max(input.networkNodes[t] * Math.pow(1 + growth, yearsMid), yours[t]);
      const tierPayout = tierPayoutForRange(t, startHeight, BLOCKS_PER_MONTH);
      flux[t] = (tierPayout * yours[t]) / network;
    }

    const fluxTotal = flux.cumulus + flux.nimbus + flux.stratus;
    const price = startPrice * Math.pow(1 + priceChange, yearsMid);
    const revenue = fluxTotal * price;
    const net = revenue - monthlyCost;
    cumulativeFlux += fluxTotal;
    cumulativeNet += net;
    if (breakEvenMonth === null && capital > 0 && cumulativeNet >= capital) breakEvenMonth = m + 1;

    out.push({
      month: m + 1,
      startHeight,
      flux,
      fluxTotal,
      price,
      revenue,
      cost: monthlyCost,
      net,
      cumulativeFlux,
      cumulativeNet,
    });
  }

  if (capital === 0 && out.length > 0 && out[0]!.net > 0) breakEvenMonth = 0;

  return {
    months: out,
    collateralFlux: collFlux,
    capital,
    breakEvenMonth,
    totalFlux: cumulativeFlux,
    totalNet: cumulativeNet,
  };
}

/** First-year FLUX earned as a % of locked collateral (reward rate in FLUX terms). */
export function fluxAprPct(tier: Tier, height: number, enabledInTier: number): number {
  if (!(enabledInTier > 0)) return 0;
  const yearFlux = tierPayoutForRange(tier, height, BLOCKS_PER_YEAR) / enabledInTier;
  return (yearFlux / COLLATERAL[tier]) * 100;
}

/** Valid transparent Flux address (t1… or t3…, 35 base58 characters). */
export const FLUX_ADDRESS_RE = /^t[13][1-9A-HJ-NP-Za-km-z]{33}$/;
