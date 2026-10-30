/** Glue between app state, live data and the shared reward math. */
import type { NetworkResponse } from "../../shared/api.ts";
import { parallelAssetEndHeight, project, type ParallelAssets, type ProjectionResult } from "../../shared/rewards.ts";
import type { AppState, Setup } from "./state.ts";

export interface Market {
  network: NetworkResponse;
  /** FLUX price in the display currency, or null while it isn't available. */
  price: number | null;
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
  });
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
