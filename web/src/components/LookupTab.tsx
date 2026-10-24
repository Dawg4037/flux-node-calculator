import { useEffect, useRef, useState, type FormEvent } from "react";
import type { LookupResponse } from "../../../shared/api.ts";
import {
  FLUX_ADDRESS_RE,
  TIERS,
  TIER_LABEL,
  heightAtTime,
  parallelAssetMultiplier,
  yearRewardPerNode,
  type ParallelAssets,
} from "../../../shared/rewards.ts";
import { lookupAddress } from "../api.ts";
import { fmtFlux, fmtInt, fmtMoney, fmtPct, fmtRelative } from "../format.ts";
import { paActiveNow } from "../model.ts";
import type { AppState } from "../state.ts";
import { Notice, TierSwatch } from "./ui.tsx";

interface Props {
  state: AppState;
  update: (p: Partial<AppState>) => void;
  price: number | null;
}

export function LookupTab({ state, update, price }: Props) {
  const [input, setInput] = useState(state.address);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ran = useRef(false);

  const run = async (address: string) => {
    setError(null);
    if (!FLUX_ADDRESS_RE.test(address)) {
      setError("Enter a full Flux payment address: 35 characters starting with t1 or t3.");
      return;
    }
    setLoading(true);
    try {
      const r = await lookupAddress(address);
      setResult(r);
      update({ address });
    } catch (e) {
      setResult(null);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Run once for an address that arrived in a shared link.
  useEffect(() => {
    if (!ran.current && state.address) {
      ran.current = true;
      void run(state.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void run(input.trim());
  };

  const c = state.currency;
  const paMult = paActiveNow(state) ? parallelAssetMultiplier({ count: state.paCount, valuePct: 100, endHeight: 0 }) : 0;
  const pa: ParallelAssets | undefined =
    result && paMult > 0
      ? {
          count: state.paCount,
          valuePct: state.paValue,
          endHeight: heightAtTime(Date.parse(`${state.paEnd}T00:00:00Z`), result.height, Date.parse(result.updatedAt)),
        }
      : undefined;
  // Next 12 months for all of this address's nodes, at today's network size.
  const year = result
    ? result.nodes.reduce(
        (acc, n) => {
          const r = yearRewardPerNode(n.tier, result.height, n.queueSize, pa);
          return { native: acc.native + r.native, total: acc.total + r.total };
        },
        { native: 0, total: 0 },
      )
    : { native: 0, total: 0 };
  const yearRate = result && result.totals.collateralFlux > 0 ? (year.total / result.totals.collateralFlux) * 100 : 0;
  const nativeRate = result && result.totals.collateralFlux > 0 ? (year.native / result.totals.collateralFlux) * 100 : 0;
  const dailyPa = result ? result.totals.expectedDailyFlux * paMult * (state.paValue / 100) : 0;
  const dailyTotal = result ? result.totals.expectedDailyFlux + dailyPa : 0;
  const h = result?.history;
  const diff = h && h.projectedFlux > 0 ? ((h.flux - h.projectedFlux) / h.projectedFlux) * 100 : null;

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="max-w-2xl">
        <label htmlFor="addr" className="block text-sm text-muted">
          Payment address
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            id="addr"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="t1… or t3…"
            autoComplete="off"
            spellCheck={false}
            maxLength={40}
            className="num w-full rounded-md border border-line bg-field px-3 py-2 text-ink outline-none focus:border-nimbus"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-md bg-ink px-4 py-2 font-medium whitespace-nowrap text-paper disabled:opacity-60"
          >
            {loading ? "Looking up…" : "Look up nodes"}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          The address your node rewards are paid to. Lookups only read public chain data.
        </p>
      </form>

      {error && <Notice tone="error">{error}</Notice>}

      {result && result.nodes.length === 0 && (
        <Notice>No nodes pay to this address. Check that it's the payment address, not the collateral address.</Notice>
      )}

      {result && result.nodes.length > 0 && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {TIERS.slice()
                .reverse()
                .map((t) => (
                  <div key={t}>
                    <dt className="flex items-center gap-2 text-sm text-muted">
                      <TierSwatch tier={t} />
                      {TIER_LABEL[t]}
                    </dt>
                    <dd className="num text-2xl font-semibold">{result.totals.nodes[t]}</dd>
                  </div>
                ))}
            </dl>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              <div>
                <dt className="text-sm text-muted">{paMult > 0 ? "Native FLUX per day" : "Expected per day"}</dt>
                <dd className="num text-2xl font-semibold">{fmtFlux(result.totals.expectedDailyFlux)}</dd>
              </div>
              {paMult > 0 && (
                <div>
                  <dt className="text-sm text-muted">Parallel assets per day</dt>
                  <dd className="num text-2xl font-semibold">{fmtFlux(dailyPa)}</dd>
                  <dd className="text-xs text-muted">Claim in Zelcore, until they end</dd>
                </div>
              )}
              {paMult > 0 && (
                <div>
                  <dt className="text-sm text-muted">Total per day</dt>
                  <dd className="num text-2xl font-semibold">{fmtFlux(dailyTotal)} FLUX</dd>
                  {price !== null && <dd className="num text-sm text-muted">{fmtMoney(dailyTotal * price, c)}</dd>}
                </div>
              )}
              {paMult === 0 && price !== null && (
                <div>
                  <dt className="text-sm text-muted">Value per day</dt>
                  <dd className="num text-2xl font-semibold">{fmtMoney(result.totals.expectedDailyFlux * price, c)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted">Yearly reward rate</dt>
                <dd className="num text-2xl font-semibold">{fmtPct(yearRate)}</dd>
                {paMult > 0 && <dd className="num text-xs text-muted">{fmtPct(nativeRate)} native</dd>}
              </div>
            </dl>
            <button
              type="button"
              onClick={() => update({ a: { ...state.a, nodes: { ...result.totals.nodes } }, tab: "earnings" })}
              className="rounded-md border border-ink px-4 py-2 text-sm font-medium"
            >
              Use these nodes in the calculator
            </button>
          </div>

          {h ? (
            <div className="rounded-md border border-line bg-surface p-4">
              <p className="text-sm text-muted">Last {h.days} days, native FLUX only</p>
              <p className="mt-1 text-xl">
                <span className="num font-semibold">{fmtFlux(h.flux)} FLUX</span> received across{" "}
                <span className="num">{fmtInt(h.payments)}</span> payouts, against{" "}
                <span className="num">{fmtFlux(h.projectedFlux)}</span> expected
                {diff !== null && (
                  <span className={`num ml-2 text-base ${diff >= -2 ? "text-gain" : "text-loss"}`}>
                    ({diff >= 0 ? "+" : ""}
                    {fmtPct(diff)})
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted">
                Parallel assets are paid on other chains, so they can't be checked here. Expected assumes today's
                node counts and counts each node from when it was confirmed. A shortfall usually means a node missed
                confirmations or was offline.
              </p>
            </div>
          ) : (
            <Notice>Payout history isn't available right now. Node details below are current.</Notice>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line text-right">
                  <th className="py-2 pr-4 text-left font-normal">Tier</th>
                  <th className="py-2 pr-4 text-left font-normal">Collateral</th>
                  <th className="py-2 pr-4 font-normal">Queue position</th>
                  <th className="py-2 pr-4 font-normal">Next payout</th>
                  <th className="py-2 pr-4 font-normal">Last paid</th>
                  <th className="py-2 font-normal">Expected per day</th>
                </tr>
              </thead>
              <tbody className="num text-right">
                {result.nodes.map((n) => (
                  <tr key={`${n.collateralRef}-${n.tier}`} className="border-b border-line/60">
                    <td className="py-2 pr-4 text-left">
                      <span className="flex items-center gap-2">
                        <TierSwatch tier={n.tier} />
                        {TIER_LABEL[n.tier]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-left text-muted">{n.collateralRef}</td>
                    <td className="py-2 pr-4">
                      {fmtInt(n.rank + 1)} of {fmtInt(n.queueSize)}
                    </td>
                    <td className="py-2 pr-4">{fmtRelative(n.nextPayoutEta)}</td>
                    <td className="py-2 pr-4">{fmtRelative(n.lastPaidAt)}</td>
                    <td className="py-2">{fmtFlux(n.expectedDailyFlux)} FLUX</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">Updated {fmtRelative(result.updatedAt)}. Node IP addresses are never shown.</p>
        </>
      )}
    </div>
  );
}
