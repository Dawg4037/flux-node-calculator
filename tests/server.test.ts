import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../server/app.ts";
import type { Config } from "../server/config.ts";
import type { LookupResponse, NetworkResponse, PriceResponse } from "../shared/api.ts";

const ADDR = "t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yoJ";
const OTHER = "t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yoK"; // shares a prefix, must be excluded
const HEIGHT = 3_063_554;

const config: Config = {
  port: 0,
  host: "127.0.0.1",
  fluxApiBaseUrl: "https://flux.test",
  coingeckoApiKey: "test-key",
  coingeckoBaseUrl: "https://cg.test/api/v3",
  priceRefreshMs: 1_200_000,
  networkRefreshMs: 90_000,
  fluxMaxConcurrency: 2,
  lookupRatePerMinute: 3,
  trustProxy: false,
  staticDir: "does-not-exist",
  version: "test",
};

const node = (addr: string, tier: string, rank: number, extra: object = {}) => ({
  collateral: "COutPoint(abc, 0)",
  txhash: "d430804ffb85f37bca175e32a0d02986491ca8c7783dcab2cc56560c09dfc7c7",
  outidx: 0,
  ip: "65.108.73.202",
  network: "ipv4",
  added_height: 2_519_998,
  confirmed_height: 2_520_000,
  last_confirmed_height: 3_063_403,
  last_paid_height: 3_061_726,
  tier,
  payment_address: addr,
  pubkey: "04deadbeef",
  activesince: "1700000000",
  lastpaid: "1792800000",
  amount: tier === "STRATUS" ? "40000.00" : "12500.00",
  rank,
  ...extra,
});

interface MockState {
  /** HTTP status CoinGecko answers with (default 200). */
  cgStatus?: number;
  failLists?: boolean;
  calls: string[];
  fluxStatus: "success" | "error";
  cgHeaders: Record<string, string> | null;
}

function mockFetch(state: MockState): typeof fetch {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    state.calls.push(url);
    if (url.startsWith("https://cg.test")) {
      state.cgHeaders = (init?.headers as Record<string, string>) ?? null;
      if (state.cgStatus && state.cgStatus !== 200) return json({ error: "nope" }, state.cgStatus);
      return json({ zelcash: { usd: 0.066058, eur: 0.058971, gbp: 0.04939125, cad: 0.092498, idr: 1107.42, last_updated_at: 1792801600 } });
    }
    const ok = (data: unknown) => json({ status: state.fluxStatus, data });
    const path = url.replace("https://flux.test", "");
    if (state.failLists && /getdoslist|getstartlist/.test(path)) return json({ status: "error", data: { code: 500 } });
    if (path === "/daemon/getblockcount") return ok(HEIGHT);
    if (path === "/daemon/getfluxnodecount")
      return ok({ "cumulus-enabled": 3333, "nimbus-enabled": 1663, "stratus-enabled": 1836, "basic-enabled": 3333, "super-enabled": 1663, "bamf-enabled": 1836 });
    if (path === "/daemon/getblocksubsidy") return ok({ miner: 14 });
    if (path === "/daemon/getdoslist")
      return ok([
        { collateral: `COutPoint(${"a".repeat(64)}, 0)`, added_height: HEIGHT - 10, payment_address: ADDR, eligible_in: 120, amount: "12500.00" },
        { collateral: `COutPoint(${"b".repeat(64)}, 1)`, added_height: HEIGHT - 10, payment_address: OTHER, eligible_in: 50, amount: "1000.00" },
        { collateral: "garbage", payment_address: ADDR, eligible_in: 5, amount: "1000.00" },
      ]);
    if (path === "/daemon/getstartlist")
      return ok([
        { collateral: `COutPoint(${"c".repeat(64)}, 2)`, added_height: HEIGHT - 5, payment_address: ADDR, expires_in: 170, amount: "1000.00" },
      ]);
    if (path.startsWith("/daemon/viewdeterministicfluxnodelist"))
      return ok([node(ADDR, "STRATUS", 0), node(ADDR, "NIMBUS", 40), node(OTHER, "STRATUS", 5)]);
    if (path.startsWith("/daemon/getaddressdeltas"))
      return ok([
        { address: ADDR, blockindex: 0, height: 3_061_003, index: 3, satoshis: 900_000_000, txid: "a" },
        { address: ADDR, blockindex: 0, height: 3_061_100, index: 2, satoshis: 350_000_000, txid: "b" },
        { address: ADDR, blockindex: 4, height: 3_061_200, index: 0, satoshis: 900_000_000, txid: "transfer" },
        { address: ADDR, blockindex: 0, height: 3_061_300, index: 1, satoshis: -100, txid: "spend" },
      ]);
    return json({ status: "error", data: { code: 404 } });
  }) as typeof fetch;
}

let close: (() => Promise<void>) | null = null;
afterEach(async () => {
  await close?.();
  close = null;
});

async function setup(overrides: Partial<MockState> = {}) {
  const state: MockState = { calls: [], fluxStatus: "success", cgHeaders: null, ...overrides };
  const built = await buildApp({ config, fetchFn: mockFetch(state), background: false, logger: false });
  await built.flux.refreshNetwork();
  await built.price.refresh();
  close = () => built.app.close();
  return { ...built, state };
}

describe("GET /api/network", () => {
  it("returns network data with the reduction countdown", async () => {
    const { app } = await setup();
    const res = await app.inject("/api/network");
    expect(res.statusCode).toBe(200);
    const body = res.json<NetworkResponse>();
    expect(body.height).toBe(HEIGHT);
    expect(body.nodes).toEqual({ cumulus: 3333, nimbus: 1663, stratus: 1836 });
    expect(body.rewardPerBlock).toEqual({ cumulus: 1, nimbus: 3.5, stratus: 9 });
    expect(body.chainBlockReward).toBe(14);
    expect(body.nextReductionHeight).toBe(3_071_200);
    expect(body.blocksToNextReduction).toBe(7_646);
    expect(body.stale).toBe(false);
  });

  it("returns 503 when Flux reports an in-band error", async () => {
    const { app } = await setup({ fluxStatus: "error" });
    const res = await app.inject("/api/network");
    expect(res.statusCode).toBe(503);
  });

  it("sends security headers", async () => {
    const { app } = await setup();
    const res = await app.inject("/api/network");
    const csp = String(res.headers["content-security-policy"]);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("script-src 'self' https://static.cloudflareinsights.com");
    expect(csp).toContain("connect-src 'self' https://cloudflareinsights.com");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(res.headers["permissions-policy"]).toContain("camera=()");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("GET /api/price", () => {
  it("returns cached prices and sends the API key only to CoinGecko", async () => {
    const { app, state } = await setup();
    const res = await app.inject("/api/price");
    expect(res.statusCode).toBe(200);
    const body = res.json<PriceResponse>();
    expect(body.prices.usd).toBe(0.066058);
    expect(body.source).toBe("CoinGecko");
    expect(state.cgHeaders?.["x-cg-demo-api-key"]).toBe("test-key");
    expect(res.body).not.toContain("test-key");
    // Serving the price again does not call CoinGecko again.
    const before = state.calls.filter((c) => c.startsWith("https://cg.test")).length;
    await app.inject("/api/price");
    expect(state.calls.filter((c) => c.startsWith("https://cg.test")).length).toBe(before);
  });
});

describe("price failures", () => {
  it("reports why the price is missing without exposing the key, and retries sooner", async () => {
    const { app, price } = await setup({ cgStatus: 429 });
    expect((await app.inject("/api/price")).statusCode).toBe(503);
    const health = (await app.inject("/api/health")).json();
    expect(health.price).toBe(false);
    expect(health.version).toBe("test");
    expect(health.priceSource).toMatchObject({ keySet: true, lastError: "HTTP 429", failuresInARow: 1 });
    expect(JSON.stringify(health)).not.toContain("test-key");
    const normal = 20 * 60_000;
    expect(price.nextDelayMs(normal)).toBe(2 * 60_000);
    await price.refresh();
    expect(price.nextDelayMs(normal)).toBe(4 * 60_000);
    await price.refresh();
    await price.refresh();
    await price.refresh();
    expect(price.nextDelayMs(normal)).toBe(normal);
  });

  it("goes back to the normal interval after a success", async () => {
    const { price, state } = await setup({ cgStatus: 500 });
    expect(price.getPrice()).toBeNull();
    state.cgStatus = 200;
    await price.refresh();
    expect(price.getPrice()?.prices.usd).toBe(0.066058);
    expect(price.status().lastError).toBeNull();
    expect(price.nextDelayMs(1_200_000)).toBe(1_200_000);
  });
});

describe("GET /api/lookup/:address", () => {
  it("rejects invalid and partial addresses before calling Flux", async () => {
    const { app, state } = await setup();
    const n = state.calls.length;
    // Test config allows 3 lookups/minute; invalid requests count toward the limit too.
    for (const bad of ["t3c4Efx", "t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yo0", "%27%3B--"]) {
      const res = await app.inject(`/api/lookup/${bad}`);
      expect(res.statusCode).toBe(400);
    }
    expect(state.calls.length).toBe(n);
  });

  it("returns only exact matches, hides IPs, and compares actual vs projected", async () => {
    const { app } = await setup();
    const res = await app.inject(`/api/lookup/${ADDR}`);
    expect(res.statusCode).toBe(200);
    const body = res.json<LookupResponse>();
    expect(body.nodes).toHaveLength(2);
    expect(body.nodes.map((n) => n.tier)).toEqual(["stratus", "nimbus"]);
    expect(body.totals.nodes).toEqual({ cumulus: 0, nimbus: 1, stratus: 1 });
    expect(body.totals.collateralFlux).toBe(52_500);
    expect(body.nodes[0]!.nextPayoutBlocks).toBe(1);
    expect(body.nodes[0]!.expectedDailyFlux).toBeCloseTo((9 * 2880) / 1836, 8);
    expect(res.body).not.toContain("65.108.73.202");
    expect(res.body).not.toContain("04deadbeef");
    // Only coinbase payments matching a tier reward count.
    expect(body.history?.payments).toBe(2);
    expect(body.history?.flux).toBeCloseTo(12.5, 8);
    expect(body.history?.fluxByTier).toEqual({ cumulus: 0, nimbus: 3.5, stratus: 9 });
    expect(body.history?.projectedFlux).toBeGreaterThan(0);
  });

  it("caches lookups and rate-limits per visitor", async () => {
    const { app, state } = await setup();
    await app.inject(`/api/lookup/${ADDR}`);
    const listCalls = () => state.calls.filter((c) => c.includes("viewdeterministicfluxnodelist")).length;
    expect(listCalls()).toBe(1);
    await app.inject(`/api/lookup/${ADDR}`);
    expect(listCalls()).toBe(1);
    await app.inject(`/api/lookup/${ADDR}`);
    const limited = await app.inject(`/api/lookup/${ADDR}`);
    expect(limited.statusCode).toBe(429);
  });
});

describe("node health", () => {
  it("adds this address's DOS and starting nodes, exact matches only", async () => {
    const { app } = await setup();
    const body = (await app.inject(`/api/lookup/${ADDR}`)).json<LookupResponse>();
    expect(body.dosNodes).toHaveLength(1);
    expect(body.dosNodes![0]).toMatchObject({ tier: "nimbus", eligibleInBlocks: 120 });
    expect(body.dosNodes![0]!.collateralRef).toBe("aaaaaaaa…aaaaaa:0");
    expect(body.startingNodes).toHaveLength(1);
    expect(body.startingNodes![0]).toMatchObject({ tier: "cumulus", expiresInBlocks: 170 });
    // Confirmed nodes are unchanged.
    expect(body.nodes).toHaveLength(2);
  });

  it("returns DOS nodes even when an address has no confirmed nodes", async () => {
    const { app } = await setup();
    const body = (await app.inject(`/api/lookup/${OTHER}`)).json<LookupResponse>();
    expect(body.dosNodes).toHaveLength(1);
    expect(body.dosNodes![0]!.tier).toBe("cumulus");
  });

  it("reports the lists as unavailable rather than empty when they fail", async () => {
    const { app } = await setup({ failLists: true });
    const body = (await app.inject(`/api/lookup/${ADDR}`)).json<LookupResponse>();
    expect(body.dosNodes).toBeNull();
    expect(body.startingNodes).toBeNull();
    expect(body.nodes).toHaveLength(2);
  });
});

describe("rate limits", () => {
  it("never limits page files, only the API", async () => {
    const { app } = await setup();
    for (let i = 0; i < 150; i++) {
      const res = await app.inject("/assets/index.css");
      expect(res.statusCode).not.toBe(429);
    }
    for (let i = 0; i < 120; i++) await app.inject("/api/network");
    const limited = await app.inject("/api/network");
    expect(limited.statusCode).toBe(429);
    // Page files still load after the API limit is hit.
    expect((await app.inject("/assets/index.css")).statusCode).not.toBe(429);
  });
});

describe("unknown routes", () => {
  it("returns JSON 404 for unknown API paths", async () => {
    const { app } = await setup();
    const res = await app.inject("/api/nope");
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: "Not found" });
  });
});
