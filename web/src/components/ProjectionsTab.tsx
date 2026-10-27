import { useMemo } from "react";
import { BLOCKS_PER_MONTH, REDUCTION_INTERVAL } from "../../../shared/rewards.ts";
import { fmtFlux, fmtMoney, fmtMonths, fmtPrice } from "../format.ts";
import { useT } from "../i18n/index.tsx";
import { hasNodes, runProjection, type Market } from "../model.ts";
import type { AppState } from "../state.ts";
import { LineChart } from "./LineChart.tsx";
import { ParallelAssetsNote, ParallelAssetsSettings } from "./ParallelAssets.tsx";
import { Notice, NumberField } from "./ui.tsx";

interface Props {
  state: AppState;
  update: (p: Partial<AppState>) => void;
  market: Market;
}

export function ProjectionsTab({ state, update, market }: Props) {
  const all = useT();
  const t = all.projections;
  const c = state.currency;
  const months = state.years * 12;

  const runs = useMemo(() => {
    const opts = (priceChangePct: number) => ({ months, priceChangePct, growthPct: state.growth });
    return {
      bear: runProjection(state, state.a, market, opts(state.bear)),
      base: runProjection(state, state.a, market, opts(state.base)),
      bull: runProjection(state, state.a, market, opts(state.bull)),
    };
  }, [state, market, months]);

  const price = market.price;
  if (price === null) return <Notice>{all.app.priceNeeded}</Notice>;

  if (!hasNodes(state.a)) {
    return <Notice>{t.needNodes}</Notice>;
  }

  const base = runs.base;
  const years = Array.from({ length: state.years }, (_, y) => {
    const slice = base.months.slice(y * 12, y * 12 + 12);
    const last = slice[slice.length - 1]!;
    return {
      year: y + 1,
      flux: slice.reduce((s, m) => s + m.fluxTotal, 0),
      pa: slice.reduce((s, m) => s + m.paFlux, 0),
      cumulativeFlux: last.cumulativeFlux + last.cumulativePaFlux,
      price: last.price,
      net: slice.reduce((s, m) => s + m.net, 0),
      cumulativeNet: last.cumulativeNet,
    };
  });

  const cuts = Math.max(0, Math.floor((market.network.height + months * BLOCKS_PER_MONTH - market.network.nextReductionHeight) / REDUCTION_INTERVAL) + 1);
  const breakEven = (m: number | null) =>
    m === null ? t.notWithin(state.years) : m === 0 ? t.immediately : t.after(fmtMonths(m));

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <div className="space-y-5">
        <p className="text-sm text-muted">
          {t.intro}
        </p>
        <NumberField label={t.years} integer min={1} max={20} value={state.years} onChange={(years) => update({ years })} />
        <NumberField
          label={t.growth}
          suffix="%"
          min={-50}
          max={200}
          value={state.growth}
          onChange={(growth) => update({ growth })}
          hint={t.growthHint}
        />
        <fieldset className="space-y-3 border-t border-line pt-5">
          <legend className="float-left mb-1 w-full text-sm font-medium">{t.priceChange}</legend>
          <NumberField label={t.low} suffix="%" min={-99} max={1000} value={state.bear} onChange={(bear) => update({ bear })} />
          <NumberField label={t.middle} suffix="%" min={-99} max={1000} value={state.base} onChange={(base) => update({ base })} />
          <NumberField label={t.high} suffix="%" min={-99} max={1000} value={state.bull} onChange={(bull) => update({ bull })} />
          <p className="text-xs text-muted">
            {t.startFrom(fmtPrice(price, c))}
          </p>
        </fieldset>
        <div className="border-t border-line pt-5">
          <ParallelAssetsSettings state={state} update={update} />
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold">{t.chartTitle}</h3>
          <p className="mb-4 text-sm text-muted">
            {t.chartIntro(state.years, cuts, state.pa)}
          </p>
          <LineChart
            ariaLabel={t.chartAria}
            series={[
              { name: t.series(t.high, state.bull), color: "var(--gain)", values: runs.bull.months.map((m) => m.cumulativeNet) },
              { name: t.series(t.middle, state.base), color: "var(--nimbus)", values: base.months.map((m) => m.cumulativeNet) },
              { name: t.series(t.low, state.bear), color: "var(--loss)", values: runs.bear.months.map((m) => m.cumulativeNet), dashed: true },
            ]}
            xLabel={(i) => t.month(i + 1)}
            xTicks={Array.from({ length: state.years }, (_, y) => y * 12 + 11)}
            tickLabel={(i) => t.year(Math.round((i + 1) / 12))}
            formatY={(v) => fmtMoney(v, c)}
            reference={base.capital > 0 ? { value: base.capital, label: t.toRecover(fmtMoney(base.capital, c)) } : undefined}
          />
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            {(
              [
                [t.high, runs.bull],
                [t.middle, runs.base],
                [t.low, runs.bear],
              ] as const
            ).map(([label, r]) => (
              <div key={label}>
                <dt className="text-muted">{t.breakEven(label)}</dt>
                <dd className="font-medium">{breakEven(r.breakEvenMonth)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="overflow-x-auto">
          <h3 className="mb-2 text-lg font-semibold">{t.tableTitle}</h3>
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-muted">
              <tr className="border-b border-line text-right">
                <th className="py-2 pr-4 text-left font-normal">{t.colYear}</th>
                <th className="py-2 pr-4 font-normal">{state.pa ? t.colNative : t.colEarned}</th>
                {state.pa && <th className="py-2 pr-4 font-normal">{t.colPa}</th>}
                <th className="py-2 pr-4 font-normal">{t.colTotal}</th>
                <th className="py-2 pr-4 font-normal">{t.colPrice}</th>
                <th className="py-2 pr-4 font-normal">{t.colNet}</th>
                <th className="py-2 font-normal">{t.colTotalNet}</th>
              </tr>
            </thead>
            <tbody className="num text-right">
              {years.map((y) => (
                <tr key={y.year} className="border-b border-line/60">
                  <td className="py-2 pr-4 text-left">{y.year}</td>
                  <td className="py-2 pr-4">{fmtFlux(y.flux)}</td>
                  {state.pa && <td className="py-2 pr-4">{y.pa > 0 ? fmtFlux(y.pa) : "—"}</td>}
                  <td className="py-2 pr-4">{fmtFlux(y.cumulativeFlux)}</td>
                  <td className="py-2 pr-4">{fmtPrice(y.price, c)}</td>
                  <td className={`py-2 pr-4 ${y.net >= 0 ? "" : "text-loss"}`}>{fmtMoney(y.net, c)}</td>
                  <td className={`py-2 ${y.cumulativeNet >= 0 ? "" : "text-loss"}`}>{fmtMoney(y.cumulativeNet, c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ParallelAssetsNote state={state} />
      </div>
    </div>
  );
}
