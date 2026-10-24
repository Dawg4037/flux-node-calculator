/** Calculator inputs, kept in the URL so any setup can be shared as a link. */
import { useCallback, useEffect, useState } from "react";
import { CURRENCIES, type Currency } from "../../shared/api.ts";
import { FLUX_ADDRESS_RE, TIERS, type PerTier } from "../../shared/rewards.ts";

export const TABS = ["earnings", "projections", "lookup"] as const;
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
};

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
    cost[t] = readNum(p, `${prefix}${TIER_KEY[t]}h`, fallback.cost[t], 0, 1_000_000);
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
  return p.toString();
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => parseState(window.location.search));

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
