import { useId, useMemo } from "react";
import { COLLATERAL, TIERS, TIER_LABEL, planNextNodes, type Tier } from "../../../shared/rewards.ts";
import { fmtFlux, fmtInt, fmtMonths } from "../format.ts";
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

/** Fractional months → "in 2 months" / "in 1 year 4 months" / "now". */
function whenLabel(months: number): string {
  if (months <= 0) return "Now";
  if (months < 1) {
    const days = Math.max(1, Math.round(months * (365.25 / 12)));
    return `In ${days} ${days === 1 ? "day" : "days"}`;
  }
  return `In ${fmtMonths(Math.round(months))}`;
}

const dateLabel = (months: number) =>
  new Date(Date.now() + months * MONTH_MS).toLocaleDateString(undefined, { month: "short", year: "numeric" });

/** Calendar month the plan year ends, e.g. "to Oct 2027". */
const yearEndLabel = (year: number) => `to ${dateLabel(year * 12)}`;

function nodesLabel(n: Record<Tier, number>): string {
  return TIERS.slice()
    .reverse()
    .filter((t) => n[t] > 0)
    .map((t) => `${n[t]} ${TIER_LABEL[t]}`)
    .join(", ");
}

export function NextNodeTab({ state, update, market }: Props) {
  const tierSelectId = useId();
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
        TIERS.map((t) => [t, planNextNodes({ ...common, target: t, reinvest: false, months: 240 })]),
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
          How long until your rewards pay for another node's collateral. Uses your nodes and costs from Earnings and ROI,
          and the network size and middle price change from Projections.
        </p>
        <NumberField
          label="FLUX you've already saved"
          suffix="FLUX"
          value={state.nnSaved}
          onChange={(nnSaved) => update({ nnSaved })}
          hint="Spare FLUX not already locked as collateral."
        />
        <Toggle
          label="Sell rewards to pay running costs"
          checked={state.nnSell}
          onChange={(nnSell) => update({ nnSell })}
          hint="Turn off if you pay hosting from other income, so all rewards are saved."
        />
        <div className="space-y-3 border-t border-line pt-5">
          <div>
            <label htmlFor={tierSelectId} className="block text-sm text-muted">
              Keep buying
            </label>
            <select
              id={tierSelectId}
              value={state.nnTier}
              onChange={(e) => update({ nnTier: e.target.value as Tier })}
              className="mt-1 w-full rounded-md border border-line bg-field px-3 py-2 text-ink"
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {TIER_LABEL[t]} ({fmtInt(COLLATERAL[t])} FLUX)
                </option>
              ))}
            </select>
          </div>
          <NumberField
            label="Plan length"
            suffix="years"
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
          <Notice>Add your nodes on the Earnings and ROI tab, or enter FLUX you've already saved.</Notice>
        ) : (
          <>
            <div>
              <p className="text-sm text-muted">
                You'd save about <span className="num font-medium text-ink">{fmtFlux(Math.max(0, savings))} FLUX</span> a
                month right now
                {state.nnSell ? " after selling enough to pay running costs" : ""}.
              </p>
              {savings <= 0 && (
                <p className="mt-2 text-sm text-loss">
                  Running costs use up all of your rewards, so nothing is saved. Lower the costs or turn off selling
                  rewards to pay them.
                </p>
              )}
            </div>

            <Section title="Your next node">
              <dl className="grid gap-4 sm:grid-cols-3">
                {TIERS.slice()
                  .reverse()
                  .map((t) => {
                    const m = single[t].milestones[0];
                    return (
                      <div key={t} className="rounded-md border border-line p-4">
                        <dt className="flex items-center gap-2 text-sm text-muted">
                          <TierSwatch tier={t} />
                          Next {TIER_LABEL[t]}
                        </dt>
                        <dd className="mt-1 text-xl font-semibold">
                          {m ? whenLabel(m.month) : "Not within 20 years"}
                        </dd>
                        <dd className="num text-sm text-muted">
                          {m && m.month > 0 ? dateLabel(m.month) + " · " : ""}
                          {fmtInt(COLLATERAL[t])} FLUX collateral
                        </dd>
                      </div>
                    );
                  })}
              </dl>
            </Section>

            <Section title={`If you keep buying ${TIER_LABEL[state.nnTier]} nodes`}>
              {plan.milestones.length === 0 ? (
                <Notice>
                  Not enough is saved for a {TIER_LABEL[state.nnTier]} within {state.nnYears}{" "}
                  {state.nnYears === 1 ? "year" : "years"}.
                </Notice>
              ) : (
                <>
                  <p className="mb-4 text-lg">
                    In {state.nnYears} {state.nnYears === 1 ? "year" : "years"} you'd add{" "}
                    <span className="num font-semibold">{plan.milestones.length}</span>{" "}
                    {TIER_LABEL[state.nnTier]} {plan.milestones.length === 1 ? "node" : "nodes"}, earning about{" "}
                    <span className="num font-semibold">
                      {fmtFlux(plan.years[plan.years.length - 1]?.dailyFlux ?? 0)} FLUX
                    </span>{" "}
                    a day at the end. The first one comes {whenLabel(plan.milestones[0]!.month).toLowerCase()}.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead className="text-muted">
                        <tr className="border-b border-line text-right">
                          <th className="py-2 pr-4 text-left font-normal">Year</th>
                          <th className="py-2 pr-4 font-normal">Nodes added</th>
                          <th className="py-2 pr-4 text-left font-normal">Your nodes at year end</th>
                          <th className="py-2 font-normal">FLUX per day</th>
                        </tr>
                      </thead>
                      <tbody className="num">
                        {plan.years.map((y) => (
                          <tr key={y.year} className="border-b border-line/60">
                            <td className="py-2 pr-4">
                              {y.year}
                              <span className="text-muted"> ({yearEndLabel(y.year)})</span>
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
                Each new node earns from the month after it's bought and adds its running cost. Reward reductions,
                network size and price change are applied month by month. Hardware and setup for new nodes aren't
                included.
              </p>
            </Section>

            {state.pa && (
              <>
                <p className="text-sm text-muted">
                  Parallel assets are counted toward savings while they last. That assumes you claim them and convert
                  them to native FLUX for collateral.
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
