/**
 * Titan shared-node staking (titan.runonflux.io), refreshed once a day and served from memory.
 *
 * Titan publishes no APR; its site works it out from the network's node counts plus its own
 * config (fee per lockup) and node list. We fetch the same public data and compute the rate in
 * the browser with the reward schedule, so the yearly 10% cut is included.
 *
 * Only what the calculator needs is kept: lockup lengths and fees, stake limits, capacity, and
 * how many of Titan's nodes are in each tier. Wallet addresses and node IPs are never passed on.
 */
import type { TitanLockup, TitanResponse } from "../shared/api.ts";
import { COLLATERAL, type PerTier } from "../shared/rewards.ts";
import { describePriceError } from "./price.ts";
import { fetchJson, type FetchFn } from "./upstream.ts";

/** After a failed refresh, retry in 15, 30, 60… minutes, up to the normal interval. */
const FIRST_RETRY_MS = 15 * 60_000;
const SECONDS_PER_MONTH = (365.25 / 12) * 86_400;

/** Used until the first successful refresh (Titan's values on 2 Nov 2026). */
export const TITAN_DEFAULTS: TitanResponse = {
  lockups: [
    { months: 3, feePct: 50 },
    { months: 6, feePct: 40 },
    { months: 12, feePct: 30 },
  ],
  nodes: { cumulus: 0, nimbus: 0, stratus: 238 },
  minStake: 50,
  maxStake: 100_000,
  capacity: 9_520_000,
  staked: 9_518_588,
  available: 1_412,
  open: true,
  updatedAt: null,
  stale: true,
};

const num = (v: unknown, min: number, max: number): number | null =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null;

/** Validates Titan's three responses into our shape; throws on anything unexpected. */
export function parseTitan(config: unknown, stats: unknown, nodes: unknown, now = new Date()): TitanResponse {
  const c = config as Record<string, unknown> | null;
  const s = stats as Record<string, unknown> | null;
  if (!c || typeof c !== "object" || !Array.isArray(c.lockups)) throw new Error("Bad Titan config");
  if (!s || typeof s !== "object") throw new Error("Bad Titan stats");
  if (!Array.isArray(nodes)) throw new Error("Bad Titan node list");

  const lockups: TitanLockup[] = [];
  for (const l of c.lockups.slice(0, 10) as Array<Record<string, unknown>>) {
    const time = num(l?.time, 86_400, 20 * 365 * 86_400);
    const fee = num(l?.fee, 0, 100);
    if (time === null || fee === null) continue;
    lockups.push({ months: Math.max(1, Math.round(time / SECONDS_PER_MONTH)), feePct: fee });
  }
  if (lockups.length === 0) throw new Error("Bad Titan config: no lockups");
  lockups.sort((a, b) => a.months - b.months);

  const tiers: PerTier<number> = { cumulus: 0, nimbus: 0, stratus: 0 };
  for (const n of nodes.slice(0, 100_000) as Array<Record<string, unknown>>) {
    const coll = num(n?.collateral, 0, 1e9);
    if (coll === null) continue;
    if (coll >= COLLATERAL.stratus) tiers.stratus++;
    else if (coll >= COLLATERAL.nimbus) tiers.nimbus++;
    else if (coll >= COLLATERAL.cumulus) tiers.cumulus++;
  }
  if (tiers.cumulus + tiers.nimbus + tiers.stratus === 0) throw new Error("Bad Titan node list: empty");

  const capacity = num(s.capacity, 0, 1e10) ?? 0;
  const staked = num(s.total, 0, 1e10) ?? 0;
  const available = num(s.available, -1e10, 1e10) ?? Math.max(0, capacity - staked);
  const minStake = num(c.minStake, 0, 1e9) ?? TITAN_DEFAULTS.minStake;
  const maxStake = num(c.maxStake, 0, 1e9) ?? TITAN_DEFAULTS.maxStake;

  return {
    lockups,
    nodes: tiers,
    minStake,
    maxStake,
    capacity,
    staked,
    available: Math.max(0, available),
    open: c.stakeDisabled !== true && c.maintenanceMode !== true && c.readOnly !== true && available >= minStake,
    updatedAt: now.toISOString(),
    stale: false,
  };
}

export class TitanClient {
  private data: TitanResponse | null = null;
  private failures = 0;
  private lastError: string | null = null;
  private lastAttemptAt: string | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: FetchFn,
    private readonly log: { warn: (o: object, m: string) => void },
  ) {}

  /** Latest Titan data; the built-in defaults until the first refresh succeeds. */
  get(): TitanResponse {
    if (this.data) return this.failures > 0 ? { ...this.data, stale: true } : this.data;
    return TITAN_DEFAULTS;
  }

  status() {
    return {
      live: this.data !== null,
      updatedAt: this.data?.updatedAt ?? null,
      lastAttemptAt: this.lastAttemptAt,
      lastError: this.lastError,
      failuresInARow: this.failures,
    };
  }

  nextDelayMs(normalMs: number): number {
    if (this.failures === 0) return normalMs;
    return Math.min(normalMs, FIRST_RETRY_MS * 2 ** (this.failures - 1));
  }

  async refresh(): Promise<void> {
    this.lastAttemptAt = new Date().toISOString();
    try {
      const [config, stats, nodes] = await Promise.all(
        ["config", "stats", "nodes"].map((p) => fetchJson(this.fetchFn, `${this.baseUrl}/${p}`, { timeoutMs: 15_000 })),
      );
      this.data = parseTitan(config, stats, nodes);
      this.failures = 0;
      this.lastError = null;
    } catch (err) {
      this.failures++;
      this.lastError = describePriceError(err);
      this.log.warn({ err: this.lastError }, "titan refresh failed");
    }
  }
}
