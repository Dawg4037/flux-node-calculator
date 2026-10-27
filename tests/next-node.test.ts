import { describe, expect, it } from "vitest";
import { BLOCKS_PER_MONTH, planNextNodes, tierPayoutForRange, type NextNodeInput } from "../shared/rewards.ts";

const H = 3_071_200; // 12.6 FLUX/block period: Cumulus 0.9, Nimbus 3.15, Stratus 8.1

const base: NextNodeInput = {
  startHeight: H,
  months: 240,
  yourNodes: { cumulus: 0, nimbus: 0, stratus: 1 },
  networkNodes: { cumulus: 3_371, nimbus: 1_676, stratus: 1_836 },
  networkGrowthPctPerYear: 0,
  startPrice: 0.066,
  priceChangePctPerYear: 0,
  monthlyCostPerNode: { cumulus: 0, nimbus: 0, stratus: 0 },
  sellToCoverCosts: true,
  savedFlux: 0,
  target: "cumulus",
  reinvest: false,
};

// One Stratus earns 8.1 × 87,660 / 1,836 ≈ 386.7 FLUX in the first month.
const stratusMonth = tierPayoutForRange("stratus", H, BLOCKS_PER_MONTH) / 1_836;

describe("next node planner", () => {
  it("finds when savings reach a Cumulus (1,000 FLUX)", () => {
    const r = planNextNodes(base);
    expect(r.monthlySavingsNow).toBeCloseTo(stratusMonth, 6);
    expect(r.milestones).toHaveLength(1);
    // ≈ 1000 / 386.7 = 2.59 months
    expect(r.milestones[0]!.month).toBeCloseTo(1000 / stratusMonth, 6);
    expect(r.milestones[0]!.nodesAfter).toEqual({ cumulus: 1, nimbus: 0, stratus: 1 });
  });

  it("counts FLUX already saved", () => {
    const r = planNextNodes({ ...base, savedFlux: 600 });
    expect(r.neededNow).toBe(400);
    expect(r.milestones[0]!.month).toBeCloseTo(400 / stratusMonth, 6);
  });

  it("is immediate when enough is already saved", () => {
    const r = planNextNodes({ ...base, savedFlux: 1_500 });
    expect(r.milestones[0]!.month).toBe(0);
    expect(r.neededNow).toBe(0);
  });

  it("selling FLUX for running costs slows saving", () => {
    // $10/month at $0.066 = 151.5 FLUX sold each month
    const r = planNextNodes({ ...base, monthlyCostPerNode: { cumulus: 0, nimbus: 0, stratus: 10 } });
    expect(r.monthlySavingsNow).toBeCloseTo(stratusMonth - 10 / 0.066, 6);
    const free = planNextNodes(base).milestones[0]!.month;
    expect(r.milestones[0]!.month).toBeGreaterThan(free);
    // Paying costs from other income restores the faster pace
    const outOfPocket = planNextNodes({ ...base, sellToCoverCosts: false, monthlyCostPerNode: { cumulus: 0, nimbus: 0, stratus: 10 } });
    expect(outOfPocket.milestones[0]!.month).toBeCloseTo(free, 6);
  });

  it("never reaches the goal when costs exceed rewards", () => {
    const r = planNextNodes({ ...base, monthlyCostPerNode: { cumulus: 0, nimbus: 0, stratus: 1_000 } });
    expect(r.monthlySavingsNow).toBeLessThan(0);
    expect(r.milestones).toHaveLength(0);
  });

  it("parallel assets speed up saving while they last", () => {
    const pa = { count: 10, valuePct: 100, endHeight: H + 100 * BLOCKS_PER_MONTH };
    const r = planNextNodes({ ...base, parallelAssets: pa });
    expect(r.monthlySavingsNow).toBeCloseTo(stratusMonth * 2, 6);
    expect(r.milestones[0]!.month).toBeCloseTo(1000 / (stratusMonth * 2), 6);
  });

  it("reinvesting compounds: each new node shortens the wait for the next", () => {
    const r = planNextNodes({ ...base, reinvest: true, months: 60 });
    expect(r.milestones.length).toBeGreaterThan(3);
    const gaps = r.milestones.slice(1).map((m, i) => m.month - r.milestones[i]!.month);
    expect(gaps[gaps.length - 1]!).toBeLessThan(gaps[0]!);
    const last = r.milestones[r.milestones.length - 1]!;
    expect(last.nodesAfter.cumulus).toBe(r.milestones.length);
    expect(last.dailyFluxAfter).toBeGreaterThan(r.milestones[0]!.dailyFluxAfter);
  });

  it("summarises each year of the plan", () => {
    const r = planNextNodes({ ...base, reinvest: true, months: 36 });
    expect(r.years.map((y) => y.year)).toEqual([1, 2, 3]);
    expect(r.years.reduce((s, y) => s + y.added, 0)).toBe(r.milestones.length);
    expect(r.years[2]!.nodes.cumulus).toBe(r.milestones.length);
  });

  it("does nothing useful with no nodes and no savings", () => {
    const r = planNextNodes({ ...base, yourNodes: { cumulus: 0, nimbus: 0, stratus: 0 } });
    expect(r.milestones).toHaveLength(0);
    expect(r.monthlySavingsNow).toBe(0);
  });
});
