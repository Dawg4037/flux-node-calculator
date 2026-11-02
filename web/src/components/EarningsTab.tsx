import { TIERS, TIER_LABEL, titanAprPct, titanSiteApyPct } from "../../../shared/rewards.ts";
import type { Currency } from "../../../shared/api.ts";
import { fmtFlux, fmtInt, fmtMoney, fmtMonths, fmtPct } from "../format.ts";
import { useT } from "../i18n/index.tsx";
import { hasHoldings, hasNodes, runProjection, titanLockupFor, type Market } from "../model.ts";
import type { AppState, Setup } from "../state.ts";
import { ParallelAssetsNote, ParallelAssetsSettings } from "./ParallelAssets.tsx";
import { Notice, NumberField, TierSwatch, Toggle } from "./ui.tsx";

interface Props {
  state: AppState;
  update: (p: Partial<AppState>) => void;
  market: Market;
}

const TITAN_URL = "https://titan.runonflux.io/";

function TitanInputs({ setup, onChange, market }: { setup: Setup; onChange: (s: Setup) => void; market: Market }) {
  const t = useT().earnings.titan;
  const titan = market.titan;
  if (!titan) return null;
  const lockup = titanLockupFor(setup, titan);
  const { height, nodes } = market.network;
  const ours = lockup ? titanAprPct(lockup.feePct, titan.nodes, height, nodes) : 0;
  const site = lockup ? titanSiteApyPct(lockup.feePct, titan.nodes, height, nodes) : 0;
  const staked = setup.titan > 0;
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1 text-sm font-medium">{t.title}</legend>
      <p className="text-xs text-muted">{t.intro}</p>
      <div className="grid grid-cols-1 gap-3">
        <NumberField
          label={t.amount}
          suffix="FLUX"
          step={50}
          max={10_000_000}
          value={setup.titan}
          onChange={(n) => onChange({ ...setup, titan: n })}
        />
        <label className="block text-sm text-muted">
          {t.lockup}
          <select
            value={lockup?.months ?? setup.titanMonths}
            onChange={(e) => onChange({ ...setup, titanMonths: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-line bg-field px-3 py-2 text-ink"
          >
            {titan.lockups.map((l) => (
              <option key={l.months} value={l.months}>
                {t.lockOption(l.months, l.feePct)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {lockup && (
        <div className="space-y-1 text-xs text-muted">
          <p className="text-sm text-ink">{t.rate(fmtPct(ours), lockup.feePct)}</p>
          <p>{t.site(fmtPct(site))}</p>
          {staked && <p>{t.notes}</p>}
          {staked && setup.titan < titan.minStake && <p className="text-loss">{t.min(fmtInt(titan.minStake))}</p>}
          {staked && setup.titan > titan.maxStake && <p className="text-loss">{t.max(fmtInt(titan.maxStake))}</p>}
          {staked && !titan.open && <p className="text-loss">{t.closed(fmtInt(titan.available))}</p>}
          {titan.updatedAt === null && <p>{t.defaults}</p>}
          <p>
            <a className="underline" href={TITAN_URL} rel="noopener noreferrer" target="_blank">
              {t.link}
            </a>
          </p>
        </div>
      )}
    </fieldset>
  );
}

function SetupInputs({
  setup,
  onChange,
  currency,
  market,
}: {
  setup: Setup;
  onChange: (s: Setup) => void;
  currency: Currency;
  market: Market;
}) {
  const sym = currency.toUpperCase();
  const t = useT().earnings;
  return (
    <div className="space-y-4">
      {TIERS.slice()
        .reverse()
        .map((tier) => (
          <fieldset key={tier} className="grid grid-cols-2 gap-3">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium">
              <TierSwatch tier={tier} />
              {TIER_LABEL[tier]}
            </legend>
            <NumberField
              label={t.nodes}
              integer
              max={10_000}
              value={setup.nodes[tier]}
              onChange={(n) => onChange({ ...setup, nodes: { ...setup.nodes, [tier]: n } })}
            />
            <NumberField
              label={t.costPerNode}
              suffix={sym}
              step={0.5}
              max={1e9}
              value={setup.cost[tier]}
              onChange={(n) => onChange({ ...setup, cost: { ...setup.cost, [tier]: n } })}
            />
          </fieldset>
        ))}
      <TitanInputs setup={setup} onChange={onChange} market={market} />
      <NumberField
        label={t.setupCost}
        suffix={sym}
        value={setup.upfront}
        onChange={(n) => onChange({ ...setup, upfront: n })}
        hint={t.setupHint}
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
  const all = useT();
  const t = all.earnings;
  const c = state.currency;
  if (!hasHoldings(setup)) return <Notice>{t.addNode}</Notice>;
  // Without today's price, FLUX amounts still work; currency amounts show a dash.
  const priced = market.price !== null;
  const money = (v: number) => (priced ? fmtMoney(v, c) : "—");

  const flat = runProjection(state, setup, market, { months: 240, priceChangePct: 0, growthPct: 0 });
  const m1 = flat.months[0]!;
  const year1 = flat.months.slice(0, 12);
  const year1Flux = year1.reduce((s, m) => s + m.fluxTotal, 0);
  const year1Pa = year1.reduce((s, m) => s + m.paFlux, 0);
  const year1Net = year1.reduce((s, m) => s + m.net, 0);
  const coll = flat.collateralFlux;
  // Reward rate counts parallel assets at their relative value.
  const rate = ((year1Flux + year1Pa * (state.pa ? state.paValue / 100 : 0)) / coll) * 100;
  const net = m1.net;
  const showPa = state.pa && year1Pa > 0;

  return (
    <div>
      {title && <h3 className="mb-3 text-lg font-semibold">{title}</h3>}
      <dl className={`grid grid-cols-2 gap-x-6 gap-y-5 ${compact ? "" : "sm:grid-cols-3"}`}>
        <div>
          <dt className="text-sm text-muted">{showPa ? t.nativePerMonth : t.fluxPerDay}</dt>
          <dd className="num text-2xl font-semibold">
            {fmtFlux(showPa ? m1.fluxTotal : m1.fluxTotal / (365.25 / 12))}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{showPa ? t.paPerMonth : t.fluxPerMonth}</dt>
          <dd className="num text-2xl font-semibold">{fmtFlux(showPa ? m1.paFlux : m1.fluxTotal)}</dd>
          {showPa && <dd className="text-xs text-muted">{t.toClaim}</dd>}
        </div>
        <div>
          <dt className="text-sm text-muted">{showPa ? t.allFlux12 : t.flux12}</dt>
          <dd className="num text-2xl font-semibold">{fmtFlux(year1Flux + year1Pa)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.revenue}</dt>
          <dd className="num text-xl">{money(m1.revenue)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.costs}</dt>
          <dd className="num text-xl">{money(m1.cost)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.net}</dt>
          <dd className={`num text-xl font-semibold ${!priced ? "" : net >= 0 ? "text-gain" : "text-loss"}`}>{money(net)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{setup.titan > 0 ? t.lockedWithTitan : t.collateralLocked}</dt>
          <dd className="num text-xl">{fmtInt(coll)} FLUX</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">
            {showPa ? t.ratePa : t.rate}
          </dt>
          <dd className="num text-xl">{fmtPct(rate)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.net12}</dt>
          <dd className={`num text-xl ${!priced ? "" : year1Net >= 0 ? "text-gain" : "text-loss"}`}>{money(year1Net)}</dd>
        </div>
      </dl>

      {!priced ? (
        <div className="mt-6 rounded-md border border-line bg-surface p-4">
          <p className="text-sm text-muted">{t.breakEvenTitle}</p>
          <p className="mt-1 text-sm">{all.app.priceNeeded}</p>
        </div>
      ) : (
      <div className="mt-6 rounded-md border border-line bg-surface p-4">
        <p className="text-sm text-muted">{t.breakEvenTitle}</p>
        <p className="mt-1 text-xl font-semibold">
          {flat.capital === 0
            ? net > 0
              ? t.profitableNow
              : t.notProfitable
            : flat.breakEvenMonth !== null
              ? t.after(fmtMonths(flat.breakEvenMonth))
              : t.notWithin20}
        </p>
        <p className="mt-1 text-sm text-muted">
          {t.recovering(fmtMoney(flat.capital, c), state.includeCollateral, state.pa && hasNodes(setup))}
        </p>
      </div>
      )}
    </div>
  );
}

export function EarningsTab({ state, update, market }: Props) {
  const t = useT().earnings;
  const c = state.currency;
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <div className="space-y-6">
        <p className="text-sm text-muted">
          {t.intro}
        </p>
        <SetupInputs setup={state.a} onChange={(a) => update({ a })} currency={c} market={market} />
        <div className="space-y-4 border-t border-line pt-5">
          <NumberField
            label={t.collateralPrice}
            suffix={c.toUpperCase()}
            step={0.001}
            value={state.collateralPrice ?? Number((market.price ?? 0).toFixed(4))}
            onChange={(n) => update({ collateralPrice: n })}
            hint={
              state.collateralPrice === null ? (
                market.price === null ? t.noPriceYet : t.usingToday
              ) : (
                <button type="button" className="underline" onClick={() => update({ collateralPrice: null })}>
                  {t.useToday}
                </button>
              )
            }
          />
          <Toggle
            label={t.countCollateral}
            checked={state.includeCollateral}
            onChange={(v) => update({ includeCollateral: v })}
            hint={t.countCollateralHint}
          />
        </div>
        <div className="border-t border-line pt-5">
          <ParallelAssetsSettings state={state} update={update} />
        </div>
        <div className="border-t border-line pt-5">
          <Toggle
            label={t.compare}
            checked={state.compare}
            onChange={(v) => update({ compare: v })}
          />
        </div>
        {state.compare && (
          <div className="border-t border-line pt-5">
            <h3 className="mb-3 text-lg font-semibold">{t.setupB}</h3>
            <SetupInputs setup={state.b} onChange={(b) => update({ b })} currency={c} market={market} />
          </div>
        )}
      </div>

      <div className="space-y-6">
      <div className={state.compare ? "grid gap-10 xl:grid-cols-2" : ""}>
        <Results
          state={state}
          setup={state.a}
          market={market}
          title={state.compare ? t.setupA : undefined}
          compact={state.compare}
        />
        {state.compare && <Results state={state} setup={state.b} market={market} title={t.setupB} compact />}
      </div>
      {(hasNodes(state.a) || (state.compare && hasNodes(state.b))) && <ParallelAssetsNote state={state} />}
      </div>
    </div>
  );
}
