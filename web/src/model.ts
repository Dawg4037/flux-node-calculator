/** Glue between app state, live data and the shared reward math. */
import type { NetworkResponse, TitanLockup, TitanResponse } from "../../shared/api.ts";
import { parallelAssetEndHeight, project, type ParallelAssets, type ProjectionResult, type TitanStake } from "../../shared/rewards.ts";
import type { AppState, Setup } from "./state.ts";

export interface Market {
  network: NetworkResponse;
  /** FLUX price in the display currency, or null while it isn't available. */
  price: number | null;
  /** Titan staking data, or null while it loads. */
  titan: TitanResponse | null;
}

export function runProjection(
  state: AppState,
  setup: Setup,
  market: Market,
  opts: { months: number; priceChangePct: number; growthPct: number },
): ProjectionResult {
  return project({
    startHeight: market.network.height,
    months: opts.months,
    yourNodes: setup.nodes,
    networkNodes: market.network.nodes,
    networkGrowthPctPerYear: opts.growthPct,
    startPrice: market.price ?? 0,
    priceChangePctPerYear: opts.priceChangePct,
    monthlyCostPerNode: setup.cost,
    upfrontCost: setup.upfront,
    collateralPrice: state.collateralPrice ?? market.price ?? 0,
    includeCollateralInBreakEven: state.includeCollateral,
    parallelAssets: parallelAssetsFor(state, market),
    titan: titanStakeFor(setup, market.titan),
  });
}

/** The chosen lockup, or the closest one Titan offers. */
export function titanLockupFor(setup: Setup, titan: TitanResponse | null): TitanLockup | undefined {
  const lockups = titan?.lockups ?? [];
  return (
    lockups.find((l) => l.months === setup.titanMonths) ??
    lockups.reduce<TitanLockup | undefined>(
      (best, l) => (!best || Math.abs(l.months - setup.titanMonths) < Math.abs(best.months - setup.titanMonths) ? l : best),
      undefined,
    )
  );
}

/** The setup's Titan stake for the shared math, or undefined when there is none. */
export function titanStakeFor(setup: Setup, titan: TitanResponse | null): TitanStake | undefined {
  const lockup = titanLockupFor(setup, titan);
  if (!titan || !lockup || !(setup.titan > 0)) return undefined;
  return { flux: setup.titan, feePct: lockup.feePct, nodes: titan.nodes };
}

/** Parallel-asset settings for the shared math, or undefined when they're switched off. */
export function parallelAssetsFor(state: AppState, market: Market): ParallelAssets | undefined {
  if (!state.pa) return undefined;
  return {
    count: state.paCount,
    valuePct: state.paValue,
    endHeight: parallelAssetEndHeight(state.paEnd, market.network.height, new Date(market.network.updatedAt).getTime()),
  };
}

/** True when parallel assets are switched on and still paying today. */
export const paActiveNow = (state: AppState) =>
  state.pa && state.paCount > 0 && Date.parse(`${state.paEnd}T00:00:00Z`) > Date.now();

export const hasNodes = (s: Setup) => s.nodes.cumulus + s.nodes.nimbus + s.nodes.stratus > 0;
/** Nodes or a Titan stake: anything that earns. */
export const hasHoldings = (s: Setup) => hasNodes(s) || s.titan > 0;
