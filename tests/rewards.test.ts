import { describe, expect, it } from "vitest";
import {
  BLOCKS_PER_MONTH,
  FLUX_ADDRESS_RE,
  dailyFluxPerNode,
  fluxAprPct,
  heightAtTime,
  nextReductionHeight,
  project,
  tierBlockReward,
  tierPayoutForRange,
  totalAprPct,
  totalBlockRewardSat,
  yearRewardPerNode,
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

describe("parallel assets", () => {
  const base: ProjectionInput = {
    startHeight: 3_071_200,
    months: 24,
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

  it("adds 10% per active asset while they last", () => {
    const r = project({ ...base, parallelAssets: { count: 9, valuePct: 100, endHeight: 99_000_000 } });
    const m = r.months[0]!;
    expect(m.paFlux).toBeCloseTo(m.fluxTotal * 0.9, 8);
    expect(m.revenue).toBeCloseTo(m.fluxTotal * 1.9, 8);
  });

  it("applies their relative value to revenue only", () => {
    const r = project({ ...base, parallelAssets: { count: 9, valuePct: 50, endHeight: 99_000_000 } });
    const m = r.months[0]!;
    expect(m.paFlux).toBeCloseTo(m.fluxTotal * 0.9, 8);
    expect(m.revenue).toBeCloseTo(m.fluxTotal * 1.45, 8);
  });

  it("stops at the end height, prorating the final month", () => {
    const end = 3_071_200 + BLOCKS_PER_MONTH * 2.5;
    const r = project({ ...base, parallelAssets: { count: 9, valuePct: 100, endHeight: end } });
    expect(r.months[1]!.paFlux).toBeCloseTo(r.months[1]!.fluxTotal * 0.9, 8);
    expect(r.months[2]!.paFlux).toBeCloseTo(r.months[2]!.fluxTotal * 0.45, 8);
    expect(r.months[3]!.paFlux).toBe(0);
  });

  it("pays nothing when excluded or already ended", () => {
    expect(project(base).totalPaFlux).toBe(0);
    expect(project({ ...base, parallelAssets: { count: 9, valuePct: 100, endHeight: 3_000_000 } }).totalPaFlux).toBe(0);
  });

  it("includes them in the yearly reward rate", () => {
    const h = 3_071_200;
    const native = fluxAprPct("stratus", h, 1_836);
    const pa = { count: 10, valuePct: 100, endHeight: 99_000_000 };
    expect(totalAprPct("stratus", h, 1_836, pa)).toBeCloseTo(native * 2, 8);
    expect(totalAprPct("stratus", h, 1_836)).toBeCloseTo(native, 8);
    // Half value → 1.5× native
    expect(totalAprPct("stratus", h, 1_836, { ...pa, valuePct: 50 })).toBeCloseTo(native * 1.5, 8);
  });

  it("stops parallel assets at their end height within the year", () => {
    const h = 3_071_200;
    const half = h + BLOCKS_PER_MONTH * 6;
    const r = yearRewardPerNode("stratus", h, 1_836, { count: 10, valuePct: 100, endHeight: half });
    expect(r.parallel).toBeCloseTo(tierPayoutForRange("stratus", h, BLOCKS_PER_MONTH * 6) / 1_836, 8);
    expect(yearRewardPerNode("stratus", h, 1_836, { count: 10, valuePct: 100, endHeight: h - 1 }).parallel).toBe(0);
  });

  it("converts dates to heights at 30 s per block", () => {
    const now = Date.UTC(2026, 9, 24);
    expect(heightAtTime(now + 86_400_000, 3_063_554, now)).toBe(3_063_554 + 2_880);
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

describe("parallel asset end", () => {
  it("uses the roadmap's exact block for the default date and estimates other dates", async () => {
    const { parallelAssetEndHeight, DEFAULT_PARALLEL_ASSET_END, DEFAULT_PARALLEL_ASSET_END_HEIGHT } = await import(
      "../shared/rewards.ts"
    );
    const now = Date.parse("2026-10-30T00:00:00Z");
    expect(parallelAssetEndHeight(DEFAULT_PARALLEL_ASSET_END, 3_075_000, now)).toBe(DEFAULT_PARALLEL_ASSET_END_HEIGHT);
    // The default date really is about when that block lands (within a few days).
    const est = parallelAssetEndHeight("2027-07-02", 3_075_000, now);
    expect(Math.abs(est - DEFAULT_PARALLEL_ASSET_END_HEIGHT)).toBeLessThan(2880 * 7);
    expect(parallelAssetEndHeight("2027-01-01", 3_075_000, now)).toBeLessThan(DEFAULT_PARALLEL_ASSET_END_HEIGHT);
  });
});
