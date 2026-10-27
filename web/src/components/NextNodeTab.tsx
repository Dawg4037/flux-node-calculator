import { useId, useMemo } from "react";
import { COLLATERAL, TIERS, TIER_LABEL, planNextNodes, type Tier } from "../../../shared/rewards.ts";
import { fmtFlux, fmtInt, fmtMonthYear, fmtMonths } from "../format.ts";
import { useT, type Messages } from "../i18n/index.tsx";
import { hasNodes, parallelAssetsFor, type Market } from "../model.ts";
import type { AppState } from "../state.ts";
import { ParallelAssetsNote } from "./ParallelAssets.tsx";
import { Notice, NumberField, Section, TierSwatch, Toggle } from "./ui.tsx";

interface Props {
  state: AppState;
  update: (p: Partial<AppState>) => void;
  market: Market;
}

const DAY_MS = 86_400_000;
const MONTH_MS = (365.25 / 12) * DAY_MS;

/** Fractional months → "In 2 months" / "In 1 year 4 months" / "Now" (lower case when inline). */
function whenLabel(t: Messages["next"], months: number, inline = false): string {
  if (months <= 0) return inline ? t.nowInline : t.now;
  if (months < 1) return t.inDays(Math.max(1, Math.round(months * (365.25 / 12))), inline);
  return t.inDuration(fmtMonths(Math.round(months)), inline);
}

const dateLabel = (months: number) => fmtMonthYear(Date.now() + months * MONTH_MS);

function nodesLabel(n: Record<Tier, number>): string {
  return TIERS.slice()
    .reverse()
    .filter((tier) => n[tier] > 0)
    .map((tier) => `${fmtInt(n[tier])} ${TIER_LABEL[tier]}`)
    .join(", ");
}

export function NextNodeTab({ state, update, market }: Props) {
  const tierSelectId = useId();
  const t = useT().next;
  const pa = useMemo(
    () => parallelAssetsFor(state, market),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pa, state.paCount, state.paValue, state.paEnd, market],
  );

  const common = useMemo(
    () => ({
      startHeight: market.network.height,
      yourNodes: state.a.nodes,
      networkNodes: market.network.nodes,
      networkGrowthPctPerYear: state.growth,
      startPrice: market.price,
      priceChangePctPerYear: state.base,
      monthlyCostPerNode: state.a.cost,
      sellToCoverCosts: state.nnSell,
      savedFlux: state.nnSaved,
      parallelAssets: pa,
    }),
    [market, state.a, state.growth, state.base, state.nnSell, state.nnSaved, pa],
  );

  const single = useMemo(
    () =>
      Object.fromEntries(
        TIERS.map((tier) => [tier, planNextNodes({ ...common, target: tier, reinvest: false, months: 240 })]),
      ) as Record<Tier, ReturnType<typeof planNextNodes>>,
    [common],
  );

  const plan = useMemo(
    () => planNextNodes({ ...common, target: state.nnTier, reinvest: true, months: state.nnYears * 12 }),
    [common, state.nnTier, state.nnYears],
  );

  const savings = single.cumulus.monthlySavingsNow;
  const canStart = hasNodes(state.a) || state.nnSaved > 0;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <div className="space-y-5">
        <p className="text-sm text-muted">
          {t.intro}
        </p>
        <NumberField
          label={t.saved}
          suffix="FLUX"
          value={state.nnSaved}
          onChange={(nnSaved) => update({ nnSaved })}
          hint={t.savedHint}
        />
        <Toggle
          label={t.sell}
          checked={state.nnSell}
          onChange={(nnSell) => update({ nnSell })}
          hint={t.sellHint}
        />
        <div className="space-y-3 border-t border-line pt-5">
          <div>
            <label htmlFor={tierSelectId} className="block text-sm text-muted">
              {t.keepBuying}
            </label>
            <select
              id={tierSelectId}
              value={state.nnTier}
              onChange={(e) => update({ nnTier: e.target.value as Tier })}
              className="mt-1 w-full rounded-md border border-line bg-field px-3 py-2 text-ink"
            >
              {TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {TIER_LABEL[tier]} ({fmtInt(COLLATERAL[tier])} FLUX)
                </option>
              ))}
            </select>
          </div>
          <NumberField
            label={t.planLength}
            suffix={t.yearsUnit}
            integer
            min={1}
            max={20}
            value={state.nnYears}
            onChange={(nnYears) => update({ nnYears })}
          />
        </div>
      </div>

      <div className="space-y-8">
        {!canStart ? (
          <Notice>{t.needInput}</Notice>
        ) : (
          <>
            <div>
              <p className="text-sm text-muted">
                {t.saving(
                  <span className="num font-medium text-ink">{fmtFlux(Math.max(0, savings))} FLUX</span>,
                  state.nnSell,
                )}
              </p>
              {savings <= 0 && (
                <p className="mt-2 text-sm text-loss">
                  {t.nothingSaved}
                </p>
              )}
            </div>

            <Section title={t.yourNext}>
              <dl className="grid gap-4 sm:grid-cols-3">
                {TIERS.slice()
                  .reverse()
                  .map((tier) => {
                    const m = single[tier].milestones[0];
                    return (
                      <div key={tier} className="rounded-md border border-line p-4">
                        <dt className="flex items-center gap-2 text-sm text-muted">
                          <TierSwatch tier={tier} />
                          {t.nextTier(TIER_LABEL[tier])}
                        </dt>
                        <dd className="mt-1 text-xl font-semibold">{m ? whenLabel(t, m.month) : t.notWithin20}</dd>
                        <dd className="num text-sm text-muted">
                          {m && m.month > 0 ? dateLabel(m.month) + " · " : ""}
                          {t.collateral(fmtInt(COLLATERAL[tier]))}
                        </dd>
                      </div>
                    );
                  })}
              </dl>
            </Section>

            <Section title={t.planTitle(TIER_LABEL[state.nnTier])}>
              {plan.milestones.length === 0 ? (
                <Notice>{t.notEnough(TIER_LABEL[state.nnTier], state.nnYears)}</Notice>
              ) : (
                <>
                  <p className="mb-4 text-lg">
                    {t.summary(
                      state.nnYears,
                      plan.milestones.length,
                      <span className="num font-semibold">{fmtInt(plan.milestones.length)}</span>,
                      TIER_LABEL[state.nnTier],
                      <span className="num font-semibold">
                        {fmtFlux(plan.years[plan.years.length - 1]?.dailyFlux ?? 0)} FLUX
                      </span>,
                      whenLabel(t, plan.milestones[0]!.month, true),
                    )}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead className="text-muted">
                        <tr className="border-b border-line text-right">
                          <th className="py-2 pr-4 text-left font-normal">{t.colYear}</th>
                          <th className="py-2 pr-4 font-normal">{t.colAdded}</th>
                          <th className="py-2 pr-4 text-left font-normal">{t.colNodes}</th>
                          <th className="py-2 font-normal">{t.colPerDay}</th>
                        </tr>
                      </thead>
                      <tbody className="num">
                        {plan.years.map((y) => (
                          <tr key={y.year} className="border-b border-line/60">
                            <td className="py-2 pr-4">
                              {y.year}
                              <span className="text-muted"> ({t.yearEnd(dateLabel(y.year * 12))})</span>
                            </td>
                            <td className="py-2 pr-4 text-right">{y.added > 0 ? `+${fmtInt(y.added)}` : "—"}</td>
                            <td className="py-2 pr-4">{nodesLabel(y.nodes)}</td>
                            <td className="py-2 text-right">{fmtFlux(y.dailyFlux)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <p className="mt-3 text-xs text-muted">
                {t.footnote}
              </p>
            </Section>

            {state.pa && (
              <>
                <p className="text-sm text-muted">
                  {t.paCounted}
                </p>
                <ParallelAssetsNote state={state} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
