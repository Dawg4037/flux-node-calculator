import { describe, expect, it } from "vitest";
import {
  BLOCKS_PER_MONTH,
  FLUX_ADDRESS_RE,
  dailyFluxPerNode,
  fluxAprPct,
  nextReductionHeight,
  project,
  tierBlockReward,
  tierPayoutForRange,
  totalBlockRewardSat,
  type ProjectionInput,
} from "../shared/rewards.ts";

describe("block reward schedule (values read from the live chain, Oct 2026)", () => {
  const chain: Array<[number, number]> = [
    [2_020_000, 14],
    [3_063_554, 14],
    [3_071_199, 14],
    [3_071_200, 12.6],
    [4_122_399, 12.6],
    [4_122_400, 11.34],
    [5_173_600, 10.206],
    [6_224_800, 9.1854],
    [7_276_000, 8.26686],
    [8_327_200, 7.440174],
    [11_480_800, 5.42388684],
  ];
  it.each(chain)("height %i pays %d FLUX in total", (height, flux) => {
    expect(totalBlockRewardSat(height)).toBe(Math.round(flux * 1e8));
  });

  it("splits the reward between tiers 1 : 3.5 : 9 (of 14)", () => {
    expect(tierBlockReward("cumulus", 3_063_554)).toBe(1);
    expect(tierBlockReward("nimbus", 3_063_554)).toBe(3.5);
    expect(tierBlockReward("stratus", 3_063_554)).toBe(9);
    expect(tierBlockReward("cumulus", 3_071_200)).toBe(0.9);
    expect(tierBlockReward("nimbus", 3_071_200)).toBe(3.15);
    expect(tierBlockReward("stratus", 3_071_200)).toBe(8.1);
  });

  it("finds the next reduction height", () => {
    expect(nextReductionHeight(3_063_554)).toBe(3_071_200);
    expect(nextReductionHeight(3_071_200)).toBe(4_122_400);
  });
});

describe("payouts", () => {
  it("handles a reduction inside the range", () => {
    // 10 blocks at 9 FLUX, then 10 at 8.1
    expect(tierPayoutForRange("stratus", 3_071_190, 20)).toBeCloseTo(171, 10);
  });

  it("computes one node's daily FLUX", () => {
    expect(dailyFluxPerNode("stratus", 3_063_554, 1_836)).toBeCloseTo((9 * 2880) / 1836, 10);
    expect(dailyFluxPerNode("stratus", 3_063_554, 0)).toBe(0);
  });

  it("computes a FLUX-terms APR", () => {
    const apr = fluxAprPct("stratus", 3_071_200, 1_836);
    // ~8.1 FLUX × 1,051,920 blocks / 1,836 nodes / 40,000 collateral ≈ 11.6%
    expect(apr).toBeGreaterThan(11);
    expect(apr).toBeLessThan(12);
  });
});

describe("projection", () => {
  const base: ProjectionInput = {
    startHeight: 3_071_200,
    months: 12,
    yourNodes: { cumulus: 0, nimbus: 0, stratus: 1 },
    networkNodes: { cumulus: 3_333, nimbus: 1_663, stratus: 1_836 },
    networkGrowthPctPerYear: 0,
    startPrice: 1,
    priceChangePctPerYear: 0,
    monthlyCostPerNode: { cumulus: 0, nimbus: 0, stratus: 0 },
    upfrontCost: 0,
    collateralPrice: 0,
    includeCollateralInBreakEven: false,
  };

  it("matches the payout math month by month", () => {
    const r = project(base);
    expect(r.months).toHaveLength(12);
    const expected = tierPayoutForRange("stratus", 3_071_200, 12 * BLOCKS_PER_MONTH) / 1_836;
    expect(r.totalFlux).toBeCloseTo(expected, 8);
  });

  it("earns less when the network grows", () => {
    const flat = project(base).totalFlux;
    const grown = project({ ...base, networkGrowthPctPerYear: 20 }).totalFlux;
    expect(grown).toBeLessThan(flat);
  });

  it("finds break-even including collateral", () => {
    const r = project({
      ...base,
      months: 240,
      startPrice: 0.066,
      collateralPrice: 0.03,
      includeCollateralInBreakEven: true,
      monthlyCostPerNode: { cumulus: 0, nimbus: 0, stratus: 5 },
    });
    expect(r.capital).toBeCloseTo(40_000 * 0.03, 8);
    // Net ≈ $20.5/month in year 1, falling ~10%/year with the reward cuts.
    // By hand: cumulative ≈ $1,179 after 7 years, crossing $1,200 early in year 8.
    expect(r.breakEvenMonth).not.toBeNull();
    expect(r.breakEvenMonth!).toBeGreaterThan(84);
    expect(r.breakEvenMonth!).toBeLessThan(96);
    const m = r.months[r.breakEvenMonth! - 1]!;
    expect(m.cumulativeNet).toBeGreaterThanOrEqual(r.capital);
    expect(r.months[r.breakEvenMonth! - 2]!.cumulativeNet).toBeLessThan(r.capital);
  });

  it("reports no break-even when costs exceed revenue", () => {
    const r = project({
      ...base,
      startPrice: 0.066,
      upfrontCost: 100,
      monthlyCostPerNode: { cumulus: 0, nimbus: 0, stratus: 1_000 },
    });
    expect(r.breakEvenMonth).toBeNull();
    expect(r.totalNet).toBeLessThan(0);
  });

  it("clamps hostile inputs", () => {
    const r = project({ ...base, months: 1e9, yourNodes: { cumulus: -5, nimbus: NaN, stratus: 1 } });
    expect(r.months).toHaveLength(240);
    expect(r.months[0]!.flux.cumulus).toBe(0);
  });
});

describe("address validation", () => {
  it("accepts real addresses", () => {
    expect(FLUX_ADDRESS_RE.test("t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yoJ")).toBe(true);
    expect(FLUX_ADDRESS_RE.test("t1TvVsSmvoi1KqBKsjMh9k8LqeEwLXMjX87")).toBe(true);
  });
  it.each([
    "t3c4Efx", // partial (the API would substring-match this)
    "t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yoJx",
    "t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yo0", // 0 is not base58
    "z3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yoJ",
    "1.2.3.4",
    "t3c4EfxLoXXSRZCRnPRF3RpjPi9mBz&a=b",
  ])("rejects %s", (bad) => {
    expect(FLUX_ADDRESS_RE.test(bad)).toBe(false);
  });
});
