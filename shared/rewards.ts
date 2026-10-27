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
// Parallel assets
// ---------------------------------------------------------------------------

/**
 * Parallel assets: FLUX tokens on other chains (10 active by default). Each active asset pays an extra 10% of every
 * node payout, on its own chain. Rewards accrue until claimed manually (Zelcore → Fusion →
 * Parallel Mining Claim), and each claim costs a network fee. Flux's PoUW v2 paper projects them
 * mined out by about 2028.
 */
export interface ParallelAssets {
  /** Number of active parallel assets. */
  count: number;
  /** Value of one parallel-asset FLUX relative to native FLUX, in % (100 = same price). */
  valuePct: number;
  /** Height after which parallel assets no longer pay. */
  endHeight: number;
}

export const PARALLEL_ASSET_SHARE = 0.1;
export const DEFAULT_PARALLEL_ASSET_COUNT = 10;
/** Projected end used by default (start of 2028, per the PoUW v2 paper). Likely to come earlier. */
export const DEFAULT_PARALLEL_ASSET_END = "2028-01-01";

/** FLUX-equivalent parallel-asset reward per 1 FLUX of native reward, while they are active. */
export function parallelAssetMultiplier(pa: ParallelAssets | undefined): number {
  if (!pa) return 0;
  const count = Number.isFinite(pa.count) ? Math.min(20, Math.max(0, Math.floor(pa.count))) : 0;
  return count * PARALLEL_ASSET_SHARE;
}

/** Converts a calendar date to an estimated block height, from a known height at a known time. */
export function heightAtTime(targetMs: number, knownHeight: number, knownAtMs: number): number {
  return Math.round(knownHeight + (targetMs - knownAtMs) / (BLOCK_TIME_SECONDS * 1000));
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
  /** Parallel-asset rewards to add on top of native FLUX; omit to exclude them. */
  parallelAssets?: ParallelAssets;
}

export interface ProjectionMonth {
  month: number; // 1-based
  startHeight: number;
  /** Native FLUX per tier. */
  flux: PerTier<number>;
  /** Native FLUX, all tiers. */
  fluxTotal: number;
  /** Parallel-asset rewards, in FLUX-equivalent tokens (before applying their relative value). */
  paFlux: number;
  price: number;
  /** Native + parallel-asset revenue. */
  revenue: number;
  cost: number;
  net: number;
  cumulativeFlux: number;
  cumulativePaFlux: number;
  cumulativeNet: number;
}

export interface ProjectionResult {
  months: ProjectionMonth[];
  collateralFlux: number;
  capital: number;
  /** First month in which cumulative net profit covers the capital; null if not within the horizon. */
  breakEvenMonth: number | null;
  totalFlux: number;
  totalPaFlux: number;
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

  const paMultiplier = parallelAssetMultiplier(input.parallelAssets);
  const paValue = clamp(input.parallelAssets?.valuePct ?? 100, 0, 200) / 100;
  const paEnd = input.parallelAssets?.endHeight ?? 0;

  const out: ProjectionMonth[] = [];
  let cumulativeFlux = 0;
  let cumulativePaFlux = 0;
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
    // Share of this month's blocks before parallel assets end.
    const paActive = paMultiplier > 0 ? clamp((paEnd - startHeight) / BLOCKS_PER_MONTH, 0, 1) : 0;
    const paFlux = fluxTotal * paMultiplier * paActive;
    const price = startPrice * Math.pow(1 + priceChange, yearsMid);
    const revenue = (fluxTotal + paFlux * paValue) * price;
    const net = revenue - monthlyCost;
    cumulativeFlux += fluxTotal;
    cumulativePaFlux += paFlux;
    cumulativeNet += net;
    if (breakEvenMonth === null && capital > 0 && cumulativeNet >= capital) breakEvenMonth = m + 1;

    out.push({
      month: m + 1,
      startHeight,
      flux,
      fluxTotal,
      paFlux,
      price,
      revenue,
      cost: monthlyCost,
      net,
      cumulativeFlux,
      cumulativePaFlux,
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
    totalPaFlux: cumulativePaFlux,
    totalNet: cumulativeNet,
  };
}

/** First-year FLUX earned as a % of locked collateral (reward rate in FLUX terms). */
export function fluxAprPct(tier: Tier, height: number, enabledInTier: number): number {
  if (!(enabledInTier > 0)) return 0;
  const yearFlux = tierPayoutForRange(tier, height, BLOCKS_PER_YEAR) / enabledInTier;
  return (yearFlux / COLLATERAL[tier]) * 100;
}

/**
 * One node's rewards over the next 12 months, split into native FLUX and parallel assets.
 * Parallel assets stop at their end height and are valued at `valuePct` of native FLUX.
 */
export function yearRewardPerNode(
  tier: Tier,
  height: number,
  enabledInTier: number,
  pa?: ParallelAssets,
): { native: number; parallel: number; total: number } {
  if (!(enabledInTier > 0)) return { native: 0, parallel: 0, total: 0 };
  const native = tierPayoutForRange(tier, height, BLOCKS_PER_YEAR) / enabledInTier;
  let parallel = 0;
  const mult = parallelAssetMultiplier(pa);
  if (pa && mult > 0) {
    const paBlocks = Math.min(BLOCKS_PER_YEAR, Math.max(0, pa.endHeight - height));
    const value = clamp(pa.valuePct, 0, 200) / 100;
    parallel = (tierPayoutForRange(tier, height, paBlocks) / enabledInTier) * mult * value;
  }
  return { native, parallel, total: native + parallel };
}

/** Yearly reward rate (% of collateral) including parallel assets while they last. */
export function totalAprPct(tier: Tier, height: number, enabledInTier: number, pa?: ParallelAssets): number {
  return (yearRewardPerNode(tier, height, enabledInTier, pa).total / COLLATERAL[tier]) * 100;
}

/** Valid transparent Flux address (t1… or t3…, 35 base58 characters). */
export const FLUX_ADDRESS_RE = /^t[13][1-9A-HJ-NP-Za-km-z]{33}$/;

// ---------------------------------------------------------------------------
// Next node planner
// ---------------------------------------------------------------------------

export interface NextNodeInput {
  startHeight: number;
  /** Planning horizon in months (1–240). */
  months: number;
  yourNodes: PerTier<number>;
  networkNodes: PerTier<number>;
  networkGrowthPctPerYear: number;
  startPrice: number;
  priceChangePctPerYear: number;
  /** Running cost per node per month, in the display currency. */
  monthlyCostPerNode: PerTier<number>;
  /** Sell rewards to pay running costs (otherwise costs are paid from other income). */
  sellToCoverCosts: boolean;
  /** FLUX already saved toward collateral. */
  savedFlux: number;
  /** Tier to save for. */
  target: Tier;
  /** After each purchase, keep saving for another node of the same tier. */
  reinvest: boolean;
  /** Parallel assets counted toward savings (at their relative value) while they last. */
  parallelAssets?: ParallelAssets;
}

export interface NextNodeMilestone {
  /** Months from now, fractional (e.g. 7.4). */
  month: number;
  /** Your nodes after this purchase. */
  nodesAfter: PerTier<number>;
  /** FLUX per day after this purchase (native + parallel assets while active). */
  dailyFluxAfter: number;
}

export interface NextNodeYear {
  /** 1-based year of the plan. */
  year: number;
  /** Nodes bought during this year. */
  added: number;
  /** Your nodes at the end of the year. */
  nodes: PerTier<number>;
  /** FLUX per day at the end of the year (native + parallel assets while active). */
  dailyFlux: number;
}

export interface NextNodeResult {
  milestones: NextNodeMilestone[];
  /** Summary at the end of each full year of the plan. */
  years: NextNodeYear[];
  /** FLUX saved per month at the start (rewards minus FLUX sold for costs). */
  monthlySavingsNow: number;
  /** FLUX still needed for the first node, after what's already saved. */
  neededNow: number;
}

/**
 * Month-by-month savings toward collateral. Rewards accrue each month (native, plus parallel
 * assets at their relative value while active); if `sellToCoverCosts`, enough FLUX is sold at that
 * month's price to pay running costs. When savings reach the target tier's collateral a node is
 * bought; with `reinvest`, saving continues and the new node earns from the next month.
 */
export function planNextNodes(input: NextNodeInput): NextNodeResult {
  const months = Math.round(clamp(input.months, 1, 240));
  const growth = clamp(input.networkGrowthPctPerYear, -99, 1000) / 100;
  const priceChange = clamp(input.priceChangePctPerYear, -99, 10000) / 100;
  const startPrice = clamp(input.startPrice, 0, 1e9);
  const need = COLLATERAL[input.target];
  const paMultiplier = parallelAssetMultiplier(input.parallelAssets);
  const paValue = clamp(input.parallelAssets?.valuePct ?? 100, 0, 200) / 100;
  const paEnd = input.parallelAssets?.endHeight ?? 0;

  const nodes: PerTier<number> = {
    cumulus: Math.max(0, Math.floor(input.yourNodes.cumulus || 0)),
    nimbus: Math.max(0, Math.floor(input.yourNodes.nimbus || 0)),
    stratus: Math.max(0, Math.floor(input.yourNodes.stratus || 0)),
  };
  let balance = Math.max(0, input.savedFlux || 0);
  const milestones: NextNodeMilestone[] = [];
  const years: NextNodeYear[] = [];
  let addedThisYear = 0;
  let monthlySavingsNow = 0;

  const networkAt = (t: Tier, yearsMid: number) =>
    Math.max(input.networkNodes[t] * Math.pow(1 + growth, yearsMid), nodes[t], 1);

  const dailyAt = (height: number, yearsMid: number) => {
    const paActive = paMultiplier > 0 && height < paEnd ? paMultiplier * paValue : 0;
    return TIERS.reduce(
      (sum, t) => sum + (nodes[t] * tierBlockReward(t, height) * BLOCKS_PER_DAY * (1 + paActive)) / networkAt(t, yearsMid),
      0,
    );
  };

  for (let m = 0; m < months; m++) {
    const startHeight = input.startHeight + m * BLOCKS_PER_MONTH;
    const yearsMid = (m + 0.5) / 12;

    let earned = 0;
    for (const t of TIERS) {
      if (nodes[t] === 0) continue;
      earned += (tierPayoutForRange(t, startHeight, BLOCKS_PER_MONTH) * nodes[t]) / networkAt(t, yearsMid);
    }
    const paActive = paMultiplier > 0 ? clamp((paEnd - startHeight) / BLOCKS_PER_MONTH, 0, 1) : 0;
    earned *= 1 + paMultiplier * paActive * paValue;

    const price = startPrice * Math.pow(1 + priceChange, yearsMid);
    const cost = TIERS.reduce((sum, t) => sum + nodes[t] * Math.max(0, input.monthlyCostPerNode[t] || 0), 0);
    const sold = input.sellToCoverCosts && price > 0 ? cost / price : 0;
    const net = earned - sold;
    if (m === 0) monthlySavingsNow = net;

    if (balance >= need && m === 0) {
      // Already have enough before any saving.
      milestones.push({ month: 0, nodesAfter: { ...nodes, [input.target]: nodes[input.target] + 1 }, dailyFluxAfter: 0 });
      balance -= need;
      nodes[input.target]++;
      milestones[milestones.length - 1]!.dailyFluxAfter = dailyAt(startHeight, yearsMid);
      if (!input.reinvest) break;
    }

    if (net > 0 && balance + net >= need) {
      // Point within the month where savings cross the collateral amount.
      const fraction = clamp((need - balance) / net, 0, 1);
      balance = balance + net - need;
      nodes[input.target]++;
      milestones.push({
        month: m + fraction,
        nodesAfter: { ...nodes },
        dailyFluxAfter: dailyAt(startHeight + fraction * BLOCKS_PER_MONTH, yearsMid),
      });
      if (!input.reinvest) break;
      // Very large savings can cover more than one node in a month.
      while (balance >= need && milestones.length < 10_000) {
        balance -= need;
        nodes[input.target]++;
        milestones.push({ month: m + 1, nodesAfter: { ...nodes }, dailyFluxAfter: dailyAt(startHeight + BLOCKS_PER_MONTH, yearsMid) });
      }
    } else {
      balance = Math.max(0, balance + net);
    }

    if ((m + 1) % 12 === 0) {
      const year = (m + 1) / 12;
      const added = milestones.length - addedThisYear;
      addedThisYear = milestones.length;
      years.push({
        year,
        added,
        nodes: { ...nodes },
        dailyFlux: dailyAt(input.startHeight + (m + 1) * BLOCKS_PER_MONTH, year),
      });
    }
  }

  return {
    milestones,
    years,
    monthlySavingsNow,
    neededNow: Math.max(0, need - Math.max(0, input.savedFlux || 0)),
  };
}
