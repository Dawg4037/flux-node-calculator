// Local stand-in for the Flux API and CoinGecko, for offline development.
// Values are a snapshot of the live network (Oct 2026).
//
//   node scripts/mock-upstream.mjs            # listens on 127.0.0.1:9999
//   FLUX_API_BASE_URL=http://127.0.0.1:9999 COINGECKO_BASE_URL=http://127.0.0.1:9999/cg npm start
//
// Demo address with nodes: t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yoJ (6 confirmed, 1 on the DOS list, 1 starting)
// Address with only a DOS node: t1JSp9NEoQBMv4CbxHdxaU699j5UNHDrgyX
import { createServer } from "node:http";

const HEIGHT = 3_063_554;
const DEMO = "t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yoJ";
const now = Math.floor(Date.now() / 1000);

const nodes = [
  ["STRATUS", 0, 3_061_726],
  ["STRATUS", 412, 3_062_140],
  ["STRATUS", 1_290, 3_061_210],
  ["NIMBUS", 88, 3_062_010],
  ["NIMBUS", 903, 3_061_500],
  ["CUMULUS", 2_410, 3_060_900],
].map(([tier, rank, lastPaid], i) => ({
  collateral: `COutPoint(${String(i).padStart(2, "0")}${"ab".repeat(31)}, 0)`,
  txhash: `${String(i).padStart(2, "0")}${"ab".repeat(31)}`,
  outidx: 0,
  ip: "203.0.113.10",
  network: "ipv4",
  added_height: 2_900_000,
  confirmed_height: 2_900_004,
  last_confirmed_height: HEIGHT - 50,
  last_paid_height: lastPaid,
  tier,
  payment_address: DEMO,
  pubkey: "04demo",
  activesince: String(now - 200 * 86400),
  lastpaid: String(now - (HEIGHT - lastPaid) * 30),
  amount: { STRATUS: "40000.00", NIMBUS: "12500.00", CUMULUS: "1000.00" }[tier],
  rank,
}));

const reward = { STRATUS: 900_000_000, NIMBUS: 350_000_000, CUMULUS: 100_000_000 };
const interval = { STRATUS: 1836, NIMBUS: 1663, CUMULUS: 3333 };
const deltas = [];
for (const n of nodes) {
  for (let h = n.last_paid_height; h > HEIGHT - 30 * 2880; h -= interval[n.tier]) {
    deltas.push({ address: DEMO, blockindex: 0, height: h, index: 1, satoshis: reward[n.tier], txid: `tx${h}` });
  }
}
// Drop a few payouts so the history shows a realistic shortfall.
deltas.splice(0, 3);

const routes = {
  "/daemon/getblockcount": HEIGHT,
  "/daemon/getfluxnodecount": {
    total: 6832, stable: 6832,
    "basic-enabled": 3333, "super-enabled": 1663, "bamf-enabled": 1836,
    "cumulus-enabled": 3333, "nimbus-enabled": 1663, "stratus-enabled": 1836,
    ipv4: 2512, ipv6: 0, onion: 0,
  },
  "/daemon/getblocksubsidy": { miner: 14 },
  "/daemon/getdoslist": [
    { collateral: `COutPoint(${"d1".repeat(32)}, 0)`, added_height: HEIGHT - 300, payment_address: DEMO, eligible_in: 180, amount: "12500.00" },
    { collateral: `COutPoint(${"d2".repeat(32)}, 1)`, added_height: HEIGHT - 400, payment_address: "t1JSp9NEoQBMv4CbxHdxaU699j5UNHDrgyX", eligible_in: 60, amount: "40000.00" },
  ],
  "/daemon/getstartlist": [
    { collateral: `COutPoint(${"e1".repeat(32)}, 0)`, added_height: HEIGHT - 20, payment_address: DEMO, expires_in: 170, amount: "1000.00" },
  ],
};

createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const send = (body) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (url.pathname === "/explorer/api/currency") return send({ status: 200, data: { rate: 0.0681, short: "FLUX" } });
  if (url.pathname === "/fx/v1/latest") {
    return send({ amount: 1, base: "USD", date: "2026-10-28", rates: { CAD: 1.4047, EUR: 0.89823, GBP: 0.75258, IDR: 18177 } });
  }
  if (url.pathname === "/cg/simple/price") {
    return send({ zelcash: { usd: 0.066058, eur: 0.058971, gbp: 0.04939125, cad: 0.092498, idr: 1107.42, last_updated_at: now } });
  }
  if (url.pathname in routes) return send({ status: "success", data: routes[url.pathname] });
  if (url.pathname === "/daemon/viewdeterministicfluxnodelist") {
    const f = url.searchParams.get("filter") ?? "";
    return send({ status: "success", data: nodes.filter((n) => n.payment_address.includes(f)) });
  }
  if (url.pathname === "/daemon/getaddressdeltas") {
    return send({ status: "success", data: url.searchParams.get("address") === DEMO ? deltas : [] });
  }
  send({ status: "error", data: { code: 404, message: "unknown route" } });
}).listen(9999, "127.0.0.1", () => console.log("mock upstream on http://127.0.0.1:9999"));
