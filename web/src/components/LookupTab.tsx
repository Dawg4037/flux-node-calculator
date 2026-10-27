import { useEffect, useRef, useState, type FormEvent } from "react";
import type { LookupResponse, StartingNode } from "../../../shared/api.ts";
import {
  FLUX_ADDRESS_RE,
  TIERS,
  TIER_LABEL,
  heightAtTime,
  parallelAssetMultiplier,
  yearRewardPerNode,
  type ParallelAssets,
} from "../../../shared/rewards.ts";
import { ApiError, lookupAddress } from "../api.ts";
import { fmtFlux, fmtInt, fmtMoney, fmtPct, fmtRelative } from "../format.ts";
import { useT, type Messages } from "../i18n/index.tsx";
import { paActiveNow } from "../model.ts";
import type { AppState } from "../state.ts";
import { Notice, TierSwatch } from "./ui.tsx";

/** "1 Cumulus node at this address is starting and must confirm in 1h 25m." */
function startingSentence(t: Messages["lookup"], starting: StartingNode[]): string {
  const soonest = starting.reduce((a, b) => (a.expiresInBlocks <= b.expiresInBlocks ? a : b));
  const when = fmtRelative(soonest.expiresAt);
  if (starting.length === 1) return t.startingOne(TIER_LABEL[soonest.tier], when);
  const parts = TIERS.slice()
    .reverse()
    .map((tier) => [tier, starting.filter((n) => n.tier === tier).length] as const)
    .filter(([, n]) => n > 0)
    .map(([tier, n]) => `${fmtInt(n)} ${TIER_LABEL[tier]}`)
    .join(", ");
  return t.startingMany(starting.length, parts, when);
}

function StatusBadge({ tone, label }: { tone: "gain" | "loss"; label: string }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${tone === "gain" ? "bg-gain" : "bg-loss"}`} />
      <span className={tone === "loss" ? "font-medium text-loss" : ""}>{label}</span>
    </span>
  );
}

interface Props {
  state: AppState;
  update: (p: Partial<AppState>) => void;
  price: number | null;
}

export function LookupTab({ state, update, price }: Props) {
  const t = useT().lookup;
  const [input, setInput] = useState(state.address);
  const [result, setResult] = useState<LookupResponse | null>(null);
  // Which message to show, so it follows a language change.
  const [error, setError] = useState<"invalid" | "tooMany" | "failed" | null>(null);
  const [loading, setLoading] = useState(false);
  const [onlyAttention, setOnlyAttention] = useState(false);
  const ran = useRef(false);

  const run = async (address: string) => {
    setError(null);
    if (!FLUX_ADDRESS_RE.test(address)) {
      setError("invalid");
      return;
    }
    setLoading(true);
    try {
      const r = await lookupAddress(address);
      setResult(r);
      update({ address });
    } catch (e) {
      setResult(null);
      const status = e instanceof ApiError ? e.status : 0;
      setError(status === 400 ? "invalid" : status === 429 ? "tooMany" : "failed");
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
  const dos = result?.dosNodes ?? [];
  const starting = result?.startingNodes ?? [];
  const healthKnown = result ? result.dosNodes !== null : false;
  const confirmedCount = result?.nodes.length ?? 0;
  const anyNodes = confirmedCount + dos.length + starting.length > 0;
  const showFilter = confirmedCount + dos.length > 20 && dos.length > 0;
  const diff = h && h.projectedFlux > 0 ? ((h.flux - h.projectedFlux) / h.projectedFlux) * 100 : null;

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="max-w-2xl">
        <label htmlFor="addr" className="block text-sm text-muted">
          {t.address}
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
            {loading ? t.lookingUp : t.lookUp}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          {t.hint}
        </p>
      </form>

      {error && <Notice tone="error">{t[error]}</Notice>}

      {result && !anyNodes && (
        <Notice>{t.noNodes}</Notice>
      )}

      {result && anyNodes && (
        <div
          role="status"
          className={`rounded-md border p-4 ${dos.length > 0 ? "border-loss/60 bg-surface" : "border-line"}`}
        >
          <p className="text-lg">
            {t.summary(
              <span className="num font-semibold">{fmtInt(confirmedCount)}</span>,
              dos.length > 0 ? <span className="num font-semibold text-loss">{fmtInt(dos.length)}</span> : null,
              starting.length > 0 ? <span className="num font-semibold">{fmtInt(starting.length)}</span> : null,
            )}
          </p>
          {dos.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              {t.dosExplain}
            </p>
          )}
          {!healthKnown && (
            <p className="mt-1 text-sm text-muted">
              {t.dosUnknown}
            </p>
          )}
        </div>
      )}

      {result && result.nodes.length > 0 && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {TIERS.slice()
                .reverse()
                .map((tier) => (
                  <div key={tier}>
                    <dt className="flex items-center gap-2 text-sm text-muted">
                      <TierSwatch tier={tier} />
                      {TIER_LABEL[tier]}
                    </dt>
                    <dd className="num text-2xl font-semibold">{fmtInt(result.totals.nodes[tier])}</dd>
                  </div>
                ))}
            </dl>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              <div>
                <dt className="text-sm text-muted">{paMult > 0 ? t.nativePerDay : t.expectedPerDay}</dt>
                <dd className="num text-2xl font-semibold">{fmtFlux(result.totals.expectedDailyFlux)}</dd>
              </div>
              {paMult > 0 && (
                <div>
                  <dt className="text-sm text-muted">{t.paPerDay}</dt>
                  <dd className="num text-2xl font-semibold">{fmtFlux(dailyPa)}</dd>
                  <dd className="text-xs text-muted">{t.claimUntil}</dd>
                </div>
              )}
              {paMult > 0 && (
                <div>
                  <dt className="text-sm text-muted">{t.totalPerDay}</dt>
                  <dd className="num text-2xl font-semibold">{fmtFlux(dailyTotal)} FLUX</dd>
                  {price !== null && <dd className="num text-sm text-muted">{fmtMoney(dailyTotal * price, c)}</dd>}
                </div>
              )}
              {paMult === 0 && price !== null && (
                <div>
                  <dt className="text-sm text-muted">{t.valuePerDay}</dt>
                  <dd className="num text-2xl font-semibold">{fmtMoney(result.totals.expectedDailyFlux * price, c)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted">{t.rate}</dt>
                <dd className="num text-2xl font-semibold">{fmtPct(yearRate)}</dd>
                {paMult > 0 && <dd className="num text-xs text-muted">{t.native(fmtPct(nativeRate))}</dd>}
              </div>
            </dl>
            <button
              type="button"
              onClick={() => update({ a: { ...state.a, nodes: { ...result.totals.nodes } }, tab: "earnings" })}
              className="rounded-md border border-ink px-4 py-2 text-sm font-medium"
            >
              {t.useNodes}
            </button>
          </div>

          {h ? (
            <div className="rounded-md border border-line bg-surface p-4">
              <p className="text-sm text-muted">{t.lastDays(h.days)}</p>
              <p className="mt-1 text-xl">
                {t.received(
                  <span className="num font-semibold">{fmtFlux(h.flux)} FLUX</span>,
                  <span className="num">{fmtInt(h.payments)}</span>,
                  <span className="num">{fmtFlux(h.projectedFlux)}</span>,
                )}
                {diff !== null && (
                  <span className={`num ml-2 text-base ${diff >= -2 ? "text-gain" : "text-loss"}`}>
                    ({diff >= 0 ? "+" : ""}
                    {fmtPct(diff)})
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted">
                {t.historyNote}
              </p>
            </div>
          ) : (
            <Notice>{t.historyMissing}</Notice>
          )}
        </>
      )}

      {result && anyNodes && (
        <>
          {showFilter && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyAttention}
                onChange={(e) => setOnlyAttention(e.target.checked)}
                className="h-4 w-4 accent-[var(--nimbus)]"
              />
              {t.onlyAttention}
            </label>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line text-right">
                  <th className="py-2 pr-4 text-left font-normal">{t.colTier}</th>
                  <th className="py-2 pr-4 text-left font-normal">{t.colStatus}</th>
                  <th className="py-2 pr-4 text-left font-normal">{t.colCollateral}</th>
                  <th className="py-2 pr-4 font-normal">{t.colQueue}</th>
                  <th className="py-2 pr-4 font-normal">{t.colNext}</th>
                  <th className="py-2 pr-4 font-normal">{t.colLast}</th>
                  <th className="py-2 font-normal">{t.colPerDay}</th>
                </tr>
              </thead>
              <tbody className="num text-right">
                {dos.map((n) => (
                  <tr key={`dos-${n.collateralRef}`} className="border-b border-line/60">
                    <td className="py-2 pr-4 text-left">
                      <span className="flex items-center gap-2">
                        <TierSwatch tier={n.tier} />
                        {TIER_LABEL[n.tier]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-left">
                      <StatusBadge tone="loss" label={t.onDos} />
                      <span className="block text-xs text-muted">
                        {n.eligibleInBlocks === 0 ? t.startNow : t.startIn(fmtRelative(n.eligibleAt))}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-left text-muted">{n.collateralRef}</td>
                    <td className="py-2 pr-4 text-muted">—</td>
                    <td className="py-2 pr-4 text-muted">{t.notPaid}</td>
                    <td className="py-2 pr-4 text-muted">—</td>
                    <td className="py-2 text-muted">—</td>
                  </tr>
                ))}
                {(onlyAttention && showFilter ? [] : result.nodes).map((n) => (
                  <tr key={`${n.collateralRef}-${n.tier}`} className="border-b border-line/60">
                    <td className="py-2 pr-4 text-left">
                      <span className="flex items-center gap-2">
                        <TierSwatch tier={n.tier} />
                        {TIER_LABEL[n.tier]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-left">
                      <StatusBadge tone="gain" label={t.confirmed} />
                    </td>
                    <td className="py-2 pr-4 text-left text-muted">{n.collateralRef}</td>
                    <td className="py-2 pr-4">
                      {t.queuePos(fmtInt(n.rank + 1), fmtInt(n.queueSize))}
                    </td>
                    <td className="py-2 pr-4">{fmtRelative(n.nextPayoutEta)}</td>
                    <td className="py-2 pr-4">{fmtRelative(n.lastPaidAt)}</td>
                    <td className="py-2">{fmtFlux(n.expectedDailyFlux)} FLUX</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {starting.length > 0 && (
            <p className="text-sm">
              {startingSentence(t, starting)}
            </p>
          )}
          <p className="text-xs text-muted">{t.updated(fmtRelative(result.updatedAt))}</p>
        </>
      )}
    </div>
  );
}
