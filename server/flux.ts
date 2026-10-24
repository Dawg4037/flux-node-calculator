/** Flux API access: shared network snapshot and per-address node lookup. */
import type { LookupHistory, LookupNode, LookupResponse, NetworkResponse } from "../shared/api.ts";
import {
  BLOCK_TIME_SECONDS,
  BLOCKS_PER_DAY,
  COLLATERAL,
  FLUX_ADDRESS_RE,
  TIERS,
  dailyFluxPerNode,
  nextReductionHeight,
  tierBlockReward,
  tierBlockRewardSat,
  tierPayoutForRange,
  totalBlockRewardSat,
  type PerTier,
  type Tier,
} from "../shared/rewards.ts";
import { Limiter, UpstreamError, fetchJson, type FetchFn } from "./upstream.ts";

const HISTORY_DAYS = 30;

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const toNum = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};
const isoFromEpoch = (v: unknown): string | null => {
  const n = toNum(v);
  return n && n > 0 ? new Date(n * 1000).toISOString() : null;
};

/** Map tier names, including the legacy BASIC/SUPER/BAMF names. */
function parseTier(v: unknown): Tier | null {
  const s = String(v ?? "").toUpperCase();
  if (s === "CUMULUS" || s === "BASIC") return "cumulus";
  if (s === "NIMBUS" || s === "NIMMBUS" || s === "SUPER") return "nimbus";
  if (s === "STRATUS" || s === "BAMF") return "stratus";
  return null;
}

export class FluxClient {
  private readonly limiter: Limiter;
  private network: NetworkResponse | null = null;
  private refreshing: Promise<void> | null = null;
  private readonly lookupCache = new Map<string, { at: number; value: LookupResponse }>();

  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: FetchFn,
    maxConcurrency: number,
    private readonly log: { warn: (o: object, m: string) => void },
    private readonly now: () => number = Date.now,
  ) {
    this.limiter = new Limiter(maxConcurrency);
  }

  /** GET a Flux API path and return `data`, rejecting in-band errors (HTTP 200 with status "error"). */
  private async get(path: string, timeoutMs = 10_000): Promise<unknown> {
    const body = await this.limiter.run(() => fetchJson(this.fetchFn, this.baseUrl + path, { timeoutMs }));
    if (!isObj(body) || body.status !== "success") {
      throw new UpstreamError("Flux API returned an error");
    }
    return body.data;
  }

  // ---------------------------------------------------------------- network

  getNetwork(): NetworkResponse | null {
    return this.network;
  }

  async refreshNetwork(): Promise<void> {
    if (this.refreshing) return this.refreshing;
    this.refreshing = (async () => {
      try {
        const height = toNum(await this.get("/daemon/getblockcount"));
        if (height === null || height <= 0) throw new UpstreamError("Bad block height");

        const counts = await this.get("/daemon/getfluxnodecount");
        if (!isObj(counts)) throw new UpstreamError("Bad node count");
        const pick = (a: string, b: string) => toNum(counts[a]) ?? toNum(counts[b]) ?? 0;
        const nodes: PerTier<number> = {
          cumulus: pick("cumulus-enabled", "basic-enabled"),
          nimbus: pick("nimbus-enabled", "super-enabled"),
          stratus: pick("stratus-enabled", "bamf-enabled"),
        };
        if (TIERS.some((t) => nodes[t] <= 0)) throw new UpstreamError("Missing node counts");

        let chainBlockReward: number | null = null;
        try {
          const sub = await this.get("/daemon/getblocksubsidy");
          chainBlockReward = isObj(sub) ? toNum(sub.miner) : null;
        } catch {
          chainBlockReward = this.network?.chainBlockReward ?? null;
        }

        const totalBlockReward = totalBlockRewardSat(height) / 1e8;
        if (chainBlockReward !== null && Math.abs(chainBlockReward - totalBlockReward) > 1e-8) {
          this.log.warn({ height, chainBlockReward, totalBlockReward }, "chain block reward differs from schedule");
        }

        const next = nextReductionHeight(height);
        const fetchedAt = this.now();
        this.network = {
          height,
          nodes,
          rewardPerBlock: {
            cumulus: tierBlockReward("cumulus", height),
            nimbus: tierBlockReward("nimbus", height),
            stratus: tierBlockReward("stratus", height),
          },
          totalBlockReward,
          chainBlockReward,
          nextReductionHeight: next,
          blocksToNextReduction: next - height,
          nextReductionEta: new Date(fetchedAt + (next - height) * BLOCK_TIME_SECONDS * 1000).toISOString(),
          updatedAt: new Date(fetchedAt).toISOString(),
          stale: false,
        };
      } catch (err) {
        if (this.network) this.network = { ...this.network, stale: true };
        this.log.warn({ err: (err as Error).message }, "network refresh failed");
      } finally {
        this.refreshing = null;
      }
    })();
    return this.refreshing;
  }

  // ----------------------------------------------------------------- lookup

  async lookup(address: string): Promise<LookupResponse> {
    if (!FLUX_ADDRESS_RE.test(address)) throw new UpstreamError("Invalid address", 400);

    const cached = this.lookupCache.get(address);
    if (cached && this.now() - cached.at < 60_000) return cached.value;

    const network = this.network;
    if (!network) throw new UpstreamError("Network data not loaded yet", 503);

    const list = await this.get(
      `/daemon/viewdeterministicfluxnodelist?filter=${encodeURIComponent(address)}`,
      15_000,
    );
    if (!Array.isArray(list)) throw new UpstreamError("Bad node list");

    const now = this.now();
    const nodes: LookupNode[] = [];
    // The API substring-matches; keep only exact payment-address matches.
    for (const raw of list) {
      if (!isObj(raw) || raw.payment_address !== address) continue;
      const tier = parseTier(raw.tier);
      if (!tier) continue;
      const rank = Math.max(0, toNum(raw.rank) ?? 0);
      const txhash = String(raw.txhash ?? "");
      const nextBlocks = rank + 1;
      nodes.push({
        tier,
        collateralFlux: toNum(raw.amount) ?? COLLATERAL[tier],
        collateralRef: txhash.length > 16 ? `${txhash.slice(0, 8)}…${txhash.slice(-6)}:${toNum(raw.outidx) ?? 0}` : txhash,
        rank,
        queueSize: network.nodes[tier],
        nextPayoutBlocks: nextBlocks,
        nextPayoutEta: new Date(now + nextBlocks * BLOCK_TIME_SECONDS * 1000).toISOString(),
        lastPaidHeight: toNum(raw.last_paid_height) || null,
        lastPaidAt: isoFromEpoch(raw.lastpaid),
        confirmedHeight: toNum(raw.confirmed_height) ?? 0,
        activeSince: isoFromEpoch(raw.activesince),
        expectedDailyFlux: dailyFluxPerNode(tier, network.height, network.nodes[tier]),
      });
      // Deliberately omitted: ip, pubkey, network.
    }
    nodes.sort((a, b) => TIERS.indexOf(b.tier) - TIERS.indexOf(a.tier) || a.rank - b.rank);

    const totals = {
      nodes: { cumulus: 0, nimbus: 0, stratus: 0 } as PerTier<number>,
      collateralFlux: 0,
      expectedDailyFlux: 0,
    };
    for (const n of nodes) {
      totals.nodes[n.tier]++;
      totals.collateralFlux += n.collateralFlux;
      totals.expectedDailyFlux += n.expectedDailyFlux;
    }

    let history: LookupHistory | null = null;
    if (nodes.length > 0) {
      try {
        history = await this.history(address, network, nodes);
      } catch (err) {
        this.log.warn({ err: (err as Error).message }, "lookup history failed");
      }
    }

    const value: LookupResponse = {
      address,
      height: network.height,
      nodes,
      totals,
      history,
      updatedAt: new Date(now).toISOString(),
    };
    this.lookupCache.set(address, { at: now, value });
    if (this.lookupCache.size > 500) {
      const oldest = this.lookupCache.keys().next().value;
      if (oldest !== undefined) this.lookupCache.delete(oldest);
    }
    return value;
  }

  /** Rewards actually received over the last 30 days vs. what the nodes were expected to earn. */
  private async history(address: string, network: NetworkResponse, nodes: LookupNode[]): Promise<LookupHistory> {
    const toHeight = network.height;
    const fromHeight = toHeight - HISTORY_DAYS * BLOCKS_PER_DAY;
    const deltas = await this.get(
      `/daemon/getaddressdeltas?address=${encodeURIComponent(address)}&start=${fromHeight}&end=${toHeight}`,
      20_000,
    );
    if (!Array.isArray(deltas)) throw new UpstreamError("Bad address deltas");

    const fluxByTier: PerTier<number> = { cumulus: 0, nimbus: 0, stratus: 0 };
    let payments = 0;
    for (const d of deltas) {
      if (!isObj(d)) continue;
      // Node rewards are paid in the block's coinbase transaction (index 0).
      if (toNum(d.blockindex) !== 0) continue;
      const sat = toNum(d.satoshis);
      const height = toNum(d.height);
      if (sat === null || sat <= 0 || height === null) continue;
      const tier = TIERS.find((t) => tierBlockRewardSat(t, height) === sat);
      if (!tier) continue;
      fluxByTier[tier] += sat / 1e8;
      payments++;
    }

    let projectedFlux = 0;
    for (const n of nodes) {
      const start = Math.max(fromHeight, n.confirmedHeight);
      const blocks = Math.max(0, toHeight - start);
      projectedFlux += tierPayoutForRange(n.tier, start, blocks) / network.nodes[n.tier];
    }

    return {
      days: HISTORY_DAYS,
      fromHeight,
      toHeight,
      payments,
      flux: fluxByTier.cumulus + fluxByTier.nimbus + fluxByTier.stratus,
      fluxByTier,
      projectedFlux,
    };
  }
}
