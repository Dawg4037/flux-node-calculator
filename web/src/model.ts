/** Glue between app state, live data and the shared reward math. */
import type { NetworkResponse } from "../../shared/api.ts";
import { project, type ProjectionResult } from "../../shared/rewards.ts";
import type { AppState, Setup } from "./state.ts";

export interface Market {
  network: NetworkResponse;
  price: number;
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
    startPrice: market.price,
    priceChangePctPerYear: opts.priceChangePct,
    monthlyCostPerNode: setup.cost,
    upfrontCost: setup.upfront,
    collateralPrice: state.collateralPrice ?? market.price,
    includeCollateralInBreakEven: state.includeCollateral,
  });
}

export const hasNodes = (s: Setup) => s.nodes.cumulus + s.nodes.nimbus + s.nodes.stratus > 0;
