/** Calculator inputs, kept in the URL so any setup can be shared as a link. */
import { useCallback, useEffect, useState } from "react";
import { CURRENCIES, type Currency } from "../../shared/api.ts";
import {
  DEFAULT_PARALLEL_ASSET_COUNT,
  DEFAULT_PARALLEL_ASSET_END,
  FLUX_ADDRESS_RE,
  TIERS,
  type PerTier,
  type Tier,
} from "../../shared/rewards.ts";

export const TABS = ["earnings", "projections", "next", "lookup"] as const;
export type Tab = (typeof TABS)[number];

export interface Setup {
  nodes: PerTier<number>;
  /** Monthly running cost per node. */
  cost: PerTier<number>;
  /** One-time setup cost. */
  upfront: number;
}

export interface AppState {
  tab: Tab;
  currency: Currency;
  a: Setup;
  compare: boolean;
  b: Setup;
  /** Price paid per FLUX for collateral; null means today's price. */
  collateralPrice: number | null;
  includeCollateral: boolean;
  years: number;
  growth: number;
  bear: number;
  base: number;
  bull: number;
  address: string;
  /** Include parallel-asset rewards. */
  pa: boolean;
  paCount: number;
  /** Value of parallel-asset FLUX vs native FLUX, in %. */
  paValue: number;
  /** Projected end date, YYYY-MM-DD. */
  paEnd: string;
  /** Next node planner: FLUX already saved toward collateral. */
  nnSaved: number;
  /** Next node planner: sell rewards to pay running costs. */
  nnSell: boolean;
  /** Next node planner: tier to keep buying. */
  nnTier: Tier;
  /** Next node planner: plan length in years. */
  nnYears: number;
}

export const DEFAULT_STATE: AppState = {
  tab: "earnings",
  currency: "usd",
  a: { nodes: { cumulus: 0, nimbus: 0, stratus: 1 }, cost: { cumulus: 10, nimbus: 20, stratus: 40 }, upfront: 0 },
  compare: false,
  b: { nodes: { cumulus: 0, nimbus: 3, stratus: 0 }, cost: { cumulus: 10, nimbus: 20, stratus: 40 }, upfront: 0 },
  collateralPrice: null,
  includeCollateral: true,
  years: 5,
  growth: 0,
  bear: -30,
  base: 0,
  bull: 30,
  address: "",
  pa: true,
  paCount: DEFAULT_PARALLEL_ASSET_COUNT,
  paValue: 100,
  paEnd: DEFAULT_PARALLEL_ASSET_END,
  nnSaved: 0,
  nnSell: true,
  nnTier: "cumulus",
  nnYears: 5,
};

/**
 * Example running costs for a currency. The defaults are sized for USD, EUR, GBP and CAD;
 * for rupiah they are converted at today's rate and rounded to a sensible step.
 */
export function exampleCosts(currency: Currency, prices: Record<Currency, number> | null): PerTier<number> | null {
  const base = DEFAULT_STATE.a.cost;
  if (currency !== "idr") return { ...base };
  if (!prices || !(prices.usd > 0) || !(prices.idr > 0)) return null;
  const rate = prices.idr / prices.usd;
  const round = (v: number) => Math.round((v * rate) / 10_000) * 10_000;
  return { cumulus: round(base.cumulus), nimbus: round(base.nimbus), stratus: round(base.stratus) };
}

/** Swap example costs to the new currency's, leaving any cost the visitor typed alone. */
export function withCurrencyExamples(
  s: Setup,
  from: Currency,
  to: Currency,
  prices: Record<Currency, number> | null,
): Setup {
  const oldEx = exampleCosts(from, prices);
  const newEx = exampleCosts(to, prices);
  if (!oldEx || !newEx) return s;
  const cost = { ...s.cost };
  for (const t of TIERS) if (cost[t] === oldEx[t]) cost[t] = newEx[t];
  return { ...s, cost };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (v: string | null) => (v && DATE_RE.test(v) && !Number.isNaN(Date.parse(v)) ? v : null);

const TIER_KEY: PerTier<string> = { cumulus: "c", nimbus: "n", stratus: "s" };

const readNum = (p: URLSearchParams, key: string, fallback: number, min: number, max: number, int = false) => {
  const raw = p.get(key);
  if (raw === null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const clamped = Math.min(max, Math.max(min, n));
  return int ? Math.round(clamped) : clamped;
};

function readSetup(p: URLSearchParams, prefix: string, fallback: Setup): Setup {
  const nodes = { ...fallback.nodes };
  const cost = { ...fallback.cost };
  for (const t of TIERS) {
    nodes[t] = readNum(p, `${prefix}${TIER_KEY[t]}`, fallback.nodes[t], 0, 10_000, true);
    cost[t] = readNum(p, `${prefix}${TIER_KEY[t]}h`, fallback.cost[t], 0, 1e9);
  }
  return { nodes, cost, upfront: readNum(p, `${prefix}up`, fallback.upfront, 0, 1e9) };
}

function writeSetup(p: URLSearchParams, prefix: string, s: Setup) {
  for (const t of TIERS) {
    p.set(`${prefix}${TIER_KEY[t]}`, String(s.nodes[t]));
    p.set(`${prefix}${TIER_KEY[t]}h`, String(s.cost[t]));
  }
  if (s.upfront) p.set(`${prefix}up`, String(s.upfront));
}

export function parseState(search: string): AppState {
  const p = new URLSearchParams(search);
  const d = DEFAULT_STATE;
  const tab = p.get("tab");
  const cur = p.get("cur");
  const addr = p.get("addr") ?? "";
  const cp = p.get("cp");
  return {
    tab: (TABS as readonly string[]).includes(tab ?? "") ? (tab as Tab) : d.tab,
    currency: (CURRENCIES as readonly string[]).includes(cur ?? "") ? (cur as Currency) : d.currency,
    a: readSetup(p, "a", d.a),
    compare: p.get("cmp") === "1",
    b: readSetup(p, "b", d.b),
    collateralPrice: cp === null || cp === "" ? null : readNum(p, "cp", 0, 0, 1e6),
    includeCollateral: p.get("ic") !== "0",
    years: readNum(p, "yrs", d.years, 1, 20, true),
    growth: readNum(p, "g", d.growth, -50, 200),
    bear: readNum(p, "pb", d.bear, -99, 1000),
    base: readNum(p, "pm", d.base, -99, 1000),
    bull: readNum(p, "pu", d.bull, -99, 1000),
    address: FLUX_ADDRESS_RE.test(addr) ? addr : "",
    pa: p.get("pa") !== "0",
    paCount: readNum(p, "pac", d.paCount, 0, 20, true),
    paValue: readNum(p, "pav", d.paValue, 0, 200),
    paEnd: validDate(p.get("pae")) ?? d.paEnd,
    nnSaved: readNum(p, "nsv", d.nnSaved, 0, 1e9),
    nnSell: p.get("nsl") !== "0",
    nnTier: (TIERS as readonly string[]).includes(p.get("ntr") ?? "") ? (p.get("ntr") as Tier) : d.nnTier,
    nnYears: readNum(p, "nyr", d.nnYears, 1, 20, true),
  };
}

export function serializeState(s: AppState): string {
  const p = new URLSearchParams();
  if (s.tab !== "earnings") p.set("tab", s.tab);
  if (s.currency !== "usd") p.set("cur", s.currency);
  writeSetup(p, "a", s.a);
  if (s.compare) {
    p.set("cmp", "1");
    writeSetup(p, "b", s.b);
  }
  if (s.collateralPrice !== null) p.set("cp", String(s.collateralPrice));
  if (!s.includeCollateral) p.set("ic", "0");
  p.set("yrs", String(s.years));
  if (s.growth) p.set("g", String(s.growth));
  p.set("pb", String(s.bear));
  p.set("pm", String(s.base));
  p.set("pu", String(s.bull));
  if (s.address) p.set("addr", s.address);
  if (!s.pa) p.set("pa", "0");
  if (s.paCount !== DEFAULT_STATE.paCount) p.set("pac", String(s.paCount));
  if (s.paValue !== DEFAULT_STATE.paValue) p.set("pav", String(s.paValue));
  if (s.paEnd !== DEFAULT_STATE.paEnd) p.set("pae", s.paEnd);
  if (s.nnSaved) p.set("nsv", String(s.nnSaved));
  if (!s.nnSell) p.set("nsl", "0");
  if (s.nnTier !== DEFAULT_STATE.nnTier) p.set("ntr", s.nnTier);
  if (s.nnYears !== DEFAULT_STATE.nnYears) p.set("nyr", String(s.nnYears));
  return p.toString();
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() =>
    // At build time (page prerender) there is no window: start from the defaults.
    parseState(typeof window === "undefined" ? "" : window.location.search),
  );

  useEffect(() => {
    const qs = serializeState(state);
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [state]);

  const update = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);
  return [state, update] as const;
}
