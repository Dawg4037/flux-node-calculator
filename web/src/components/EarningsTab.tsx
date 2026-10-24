import { TIERS, TIER_LABEL, collateralFlux } from "../../../shared/rewards.ts";
import type { Currency } from "../../../shared/api.ts";
import { fmtFlux, fmtInt, fmtMoney, fmtMonths, fmtPct } from "../format.ts";
import { hasNodes, runProjection, type Market } from "../model.ts";
import type { AppState, Setup } from "../state.ts";
import { ParallelAssetsNote, ParallelAssetsSettings } from "./ParallelAssets.tsx";
import { Notice, NumberField, TierSwatch, Toggle } from "./ui.tsx";

interface Props {
  state: AppState;
  update: (p: Partial<AppState>) => void;
  market: Market;
}

function SetupInputs({
  setup,
  onChange,
  currency,
}: {
  setup: Setup;
  onChange: (s: Setup) => void;
  currency: Currency;
}) {
  const sym = currency.toUpperCase();
  return (
    <div className="space-y-4">
      {TIERS.slice()
        .reverse()
        .map((t) => (
          <fieldset key={t} className="grid grid-cols-2 gap-3">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium">
              <TierSwatch tier={t} />
              {TIER_LABEL[t]}
            </legend>
            <NumberField
              label="Nodes"
              integer
              max={10_000}
              value={setup.nodes[t]}
              onChange={(n) => onChange({ ...setup, nodes: { ...setup.nodes, [t]: n } })}
            />
            <NumberField
              label="Cost per node / month"
              suffix={sym}
              step={0.5}
              max={1_000_000}
              value={setup.cost[t]}
              onChange={(n) => onChange({ ...setup, cost: { ...setup.cost, [t]: n } })}
            />
          </fieldset>
        ))}
      <NumberField
        label="One-time setup cost"
        suffix={sym}
        value={setup.upfront}
        onChange={(n) => onChange({ ...setup, upfront: n })}
        hint="Hardware or anything else you pay once."
      />
    </div>
  );
}

function Results({
  state,
  setup,
  market,
  title,
  compact = false,
}: {
  state: AppState;
  setup: Setup;
  market: Market;
  title?: string;
  compact?: boolean;
}) {
  const c = state.currency;
  if (!hasNodes(setup)) return <Notice>Add at least one node to see earnings.</Notice>;

  const flat = runProjection(state, setup, market, { months: 240, priceChangePct: 0, growthPct: 0 });
  const m1 = flat.months[0]!;
  const year1 = flat.months.slice(0, 12);
  const year1Flux = year1.reduce((s, m) => s + m.fluxTotal, 0);
  const year1Pa = year1.reduce((s, m) => s + m.paFlux, 0);
  const year1Net = year1.reduce((s, m) => s + m.net, 0);
  const coll = collateralFlux(setup.nodes);
  // Reward rate counts parallel assets at their relative value.
  const rate = ((year1Flux + year1Pa * (state.pa ? state.paValue / 100 : 0)) / coll) * 100;
  const net = m1.net;
  const showPa = state.pa && year1Pa > 0;

  return (
    <div>
      {title && <h3 className="mb-3 text-lg font-semibold">{title}</h3>}
      <dl className={`grid grid-cols-2 gap-x-6 gap-y-5 ${compact ? "" : "sm:grid-cols-3"}`}>
        <div>
          <dt className="text-sm text-muted">{showPa ? "Native FLUX per month" : "FLUX per day"}</dt>
          <dd className="num text-2xl font-semibold">
            {fmtFlux(showPa ? m1.fluxTotal : m1.fluxTotal / (365.25 / 12))}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{showPa ? "Parallel assets per month" : "FLUX per month"}</dt>
          <dd className="num text-2xl font-semibold">{fmtFlux(showPa ? m1.paFlux : m1.fluxTotal)}</dd>
          {showPa && <dd className="text-xs text-muted">To be claimed</dd>}
        </div>
        <div>
          <dt className="text-sm text-muted">{showPa ? "All FLUX, next 12 months" : "FLUX next 12 months"}</dt>
          <dd className="num text-2xl font-semibold">{fmtFlux(year1Flux + year1Pa)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Revenue per month</dt>
          <dd className="num text-xl">{fmtMoney(m1.revenue, c)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Costs per month</dt>
          <dd className="num text-xl">{fmtMoney(m1.cost, c)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Net per month</dt>
          <dd className={`num text-xl font-semibold ${net >= 0 ? "text-gain" : "text-loss"}`}>{fmtMoney(net, c)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Collateral locked</dt>
          <dd className="num text-xl">{fmtInt(coll)} FLUX</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">
            {showPa ? "Yearly reward rate, incl. parallel assets" : "Yearly reward rate"}
          </dt>
          <dd className="num text-xl">{fmtPct(rate)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Net next 12 months</dt>
          <dd className={`num text-xl ${year1Net >= 0 ? "text-gain" : "text-loss"}`}>{fmtMoney(year1Net, c)}</dd>
        </div>
      </dl>

      <div className="mt-6 rounded-md border border-line bg-surface p-4">
        <p className="text-sm text-muted">Break-even at today's price and network size</p>
        <p className="mt-1 text-xl font-semibold">
          {flat.capital === 0
            ? net > 0
              ? "Profitable from the first month"
              : "Not profitable at these costs"
            : flat.breakEvenMonth !== null
              ? `After ${fmtMonths(flat.breakEvenMonth)}`
              : "Not within 20 years"}
        </p>
        <p className="mt-1 text-sm text-muted">
          Recovering {fmtMoney(flat.capital, c)}
          {state.includeCollateral ? " including collateral" : " in setup costs"}. Rewards fall 10% at each yearly
          reduction{state.pa ? " and parallel assets stop at their end date" : ""}, so later months earn less.
        </p>
      </div>
    </div>
  );
}

export function EarningsTab({ state, update, market }: Props) {
  const c = state.currency;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <div className="space-y-6">
        <p className="text-sm text-muted">
          Enter how many nodes you run and what each one costs you per month. The costs filled in are examples.
        </p>
        <SetupInputs setup={state.a} onChange={(a) => update({ a })} currency={c} />
        <div className="space-y-4 border-t border-line pt-5">
          <NumberField
            label="Price you paid per FLUX for collateral"
            suffix={c.toUpperCase()}
            step={0.001}
            value={state.collateralPrice ?? Number(market.price.toFixed(4))}
            onChange={(n) => update({ collateralPrice: n })}
            hint={
              state.collateralPrice === null ? (
                "Using today's price."
              ) : (
                <button type="button" className="underline" onClick={() => update({ collateralPrice: null })}>
                  Use today's price
                </button>
              )
            }
          />
          <Toggle
            label="Count the collateral purchase in break-even"
            checked={state.includeCollateral}
            onChange={(v) => update({ includeCollateral: v })}
            hint="Collateral stays yours and can be unlocked, but buying it is money spent."
          />
        </div>
        <div className="border-t border-line pt-5">
          <ParallelAssetsSettings state={state} update={update} />
        </div>
        <div className="border-t border-line pt-5">
          <Toggle
            label="Compare with a second setup"
            checked={state.compare}
            onChange={(v) => update({ compare: v })}
          />
        </div>
        {state.compare && (
          <div className="border-t border-line pt-5">
            <h3 className="mb-3 text-lg font-semibold">Setup B</h3>
            <SetupInputs setup={state.b} onChange={(b) => update({ b })} currency={c} />
          </div>
        )}
      </div>

      <div className="space-y-6">
      <div className={state.compare ? "grid gap-10 xl:grid-cols-2" : ""}>
        <Results
          state={state}
          setup={state.a}
          market={market}
          title={state.compare ? "Setup A" : undefined}
          compact={state.compare}
        />
        {state.compare && <Results state={state} setup={state.b} market={market} title="Setup B" compact />}
      </div>
      <ParallelAssetsNote state={state} />
      </div>
    </div>
  );
}
