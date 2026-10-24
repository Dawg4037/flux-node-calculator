import { useEffect, useState } from "react";
import { CURRENCIES, type Currency, type NetworkResponse, type PriceResponse } from "../../../shared/api.ts";
import {
  REDUCTION_INTERVAL,
  SCHEDULE_START_HEIGHT,
  totalBlockRewardSat,
} from "../../../shared/rewards.ts";
import { fmtDate, fmtDuration, fmtInt, fmtPrice } from "../format.ts";
import { THEMES, type Theme } from "../theme.ts";

/** Exact step values (14, 12.6, 11.34, 10.206…), trimmed to 4 decimals. */
const stepLabel = (v: number) => String(Number(v.toFixed(4)));

interface Props {
  network: NetworkResponse | null;
  price: PriceResponse | null;
  currency: Currency;
  onCurrency: (c: Currency) => void;
  theme: Theme;
  onTheme: (t: Theme) => void;
}

const THEME_LABEL: Record<Theme, string> = { system: "System", light: "Light", dark: "Dark" };

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/**
 * The block reward as a staircase: each step is one reduction period (~1 year).
 * Shows the current period and the next few, with a marker for today.
 */
function RewardStaircase({ height }: { height: number }) {
  const current = Math.floor((height - SCHEDULE_START_HEIGHT) / REDUCTION_INTERVAL);
  const first = Math.max(0, current - 1);
  const steps = Array.from({ length: 6 }, (_, i) => first + i);
  const values = steps.map((k) => totalBlockRewardSat(SCHEDULE_START_HEIGHT + k * REDUCTION_INTERVAL) / 1e8);
  const max = 14;

  const W = 600;
  const H = 150;
  const top = 26;
  const stepW = W / steps.length;
  const y = (v: number) => top + (1 - v / max) * (H - top - 10);

  let d = "";
  values.forEach((v, i) => {
    const x0 = i * stepW;
    const x1 = x0 + stepW;
    d += i === 0 ? `M ${x0} ${y(v)} H ${x1}` : ` V ${y(v)} H ${x1}`;
  });

  const progress = (height - (SCHEDULE_START_HEIGHT + current * REDUCTION_INTERVAL)) / REDUCTION_INTERVAL;
  const markerX = (current - first + progress) * stepW;
  const markerV = values[current - first] ?? 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label={`Block reward schedule: ${values.map(stepLabel).join(", ")} FLUX per block in consecutive reduction periods. You are in the period paying ${stepLabel(markerV)} FLUX.`}
    >
      <path d={`${d} V ${H} H 0 Z`} fill="var(--line)" opacity="0.35" />
      <path d={d} fill="none" stroke="var(--nimbus)" strokeWidth="3" className="step-in" />
      {values.map((v, i) => (
        <text
          key={steps[i]}
          x={i * stepW + 8}
          y={y(v) - 8}
          fill={steps[i] === current ? "var(--ink)" : "var(--muted)"}
          fontSize="15"
          fontWeight={steps[i] === current ? 650 : 450}
          className="num"
        >
          {stepLabel(v)}
        </text>
      ))}
      <line x1={markerX} x2={markerX} y1={y(markerV)} y2={H} stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={markerX} cy={y(markerV)} r="5" fill="var(--ink)" />
    </svg>
  );
}

export function Header({ network, price, currency, onCurrency, theme, onTheme }: Props) {
  const now = useNow();
  const etaMs = network ? new Date(network.nextReductionEta).getTime() - now : 0;

  return (
    <header className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold tracking-tight">Flux Node Calculator</p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted">
            Theme
            <select
              value={theme}
              onChange={(e) => onTheme(e.target.value as Theme)}
              className="rounded-md border border-line bg-field px-2 py-1 text-ink"
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {THEME_LABEL[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            Currency
            <select
              value={currency}
              onChange={(e) => onCurrency(e.target.value as Currency)}
              className="rounded-md border border-line bg-field px-2 py-1 text-ink"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end">
        <div>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            What will your FluxNodes earn?
          </h1>
          <p className="mt-3 max-w-prose text-muted">
            Rewards are set by the chain: every block pays one node in each tier, and the block reward drops 10% about once a
            year. Estimates use live network data.
          </p>
          {network && (
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted">Block height</dt>
                <dd className="num text-lg font-medium">{fmtInt(network.height)}</dd>
              </div>
              <div>
                <dt className="text-muted">FLUX price</dt>
                <dd className="num text-lg font-medium">
                  {price ? fmtPrice(price.prices[currency], currency) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Next 10% cut</dt>
                <dd className="num text-lg font-medium">{fmtDuration(etaMs)}</dd>
              </div>
              <div>
                <dt className="text-muted">At block</dt>
                <dd className="num text-lg font-medium">{fmtInt(network.nextReductionHeight)}</dd>
              </div>
            </dl>
          )}
          {(network?.stale || price?.stale) && (
            <p className="mt-3 text-xs text-muted">
              Showing data from {fmtDate(network?.stale ? network.updatedAt : (price?.updatedAt ?? null))}; the latest refresh
              didn't respond.
            </p>
          )}
        </div>
        <figure>
          {network ? (
            <RewardStaircase height={network.height} />
          ) : (
            <div className="h-36 animate-pulse rounded-md bg-line/40" aria-hidden />
          )}
          <figcaption className="mt-2 text-sm text-muted">
            Total FLUX per block, by reduction period. The marker is today.
          </figcaption>
        </figure>
      </div>
    </header>
  );
}
