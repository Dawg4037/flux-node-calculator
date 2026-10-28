import { useId, useState, type PointerEvent } from "react";

export interface Series {
  name: string;
  color: string;
  values: number[];
  dashed?: boolean;
}

interface Props {
  series: Series[];
  /** Label for x index i (0-based). */
  xLabel: (i: number) => string;
  /** Indices where an x tick is drawn. */
  xTicks: number[];
  /** Optional shorter label for ticks. */
  tickLabel?: (i: number) => string;
  formatY: (v: number) => string;
  /** Shorter format for axis labels; defaults to formatY. */
  formatTick?: (v: number) => string;
  /** Horizontal reference line. */
  reference?: { value: number; label: string };
  ariaLabel: string;
}

function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const span = max - min;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? mag * 10;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** Small dependency-free SVG line chart with a hover readout. */
export function LineChart({ series, xLabel, xTicks, tickLabel, formatY, formatTick = formatY, reference, ariaLabel }: Props) {
  const clipId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const n = series[0]?.values.length ?? 0;
  if (n === 0) return null;

  const all = series.flatMap((s) => s.values).concat(reference ? [reference.value] : [], [0]);
  const yMin = Math.min(...all);
  const yMax = Math.max(...all);
  const ticks = niceTicks(yMin, yMax);
  const lo = Math.min(yMin, ticks[0] ?? yMin);
  const hi = Math.max(yMax, ticks[ticks.length - 1] ?? yMax);

  const W = 720;
  const H = 300;
  const pad = { l: 72, r: 16, t: 12, b: 32 };
  const x = (i: number) => pad.l + (n === 1 ? 0 : (i / (n - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (hi === lo ? 0.5 : (hi - v) / (hi - lo)) * (H - pad.t - pad.b);

  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * (W - pad.l - pad.r);
    setHover(Math.max(0, Math.min(n - 1, Math.round((px / (W - pad.l - pad.r)) * (n - 1)))));
  };

  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-2">
            <svg width="22" height="8" aria-hidden>
              <line x1="0" x2="22" y1="4" y2="4" stroke={s.color} strokeWidth="3" strokeDasharray={s.dashed ? "4 3" : undefined} />
            </svg>
            {s.name}
            {hover !== null && <span className="num text-muted">{formatY(s.values[hover] ?? 0)}</span>}
          </li>
        ))}
        {hover !== null && <li className="text-muted">{xLabel(hover)}</li>}
      </ul>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
        <defs>
          <clipPath id={clipId}>
            <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
          </clipPath>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={t === 0 ? 1.5 : 1} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="var(--muted)" className="num">
              {formatTick(t)}
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 10}
            textAnchor={i === n - 1 ? "end" : "middle"}
            fontSize="12"
            fill="var(--muted)"
          >
            {tickLabel ? tickLabel(i) : xLabel(i)}
          </text>
        ))}
        {reference && (
          <g>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(reference.value)}
              y2={y(reference.value)}
              stroke="var(--ink)"
              strokeWidth="1"
              strokeDasharray="5 4"
            />
            <text
              x={W - pad.r}
              y={y(reference.value) < pad.t + 18 ? y(reference.value) + 16 : y(reference.value) - 6}
              textAnchor="end"
              fontSize="12"
              fill="var(--ink)"
            >
              {reference.label}
            </text>
          </g>
        )}
        <g clipPath={`url(#${clipId})`}>
          {series.map((s) => (
            <path
              key={s.name}
              d={path(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeDasharray={s.dashed ? "6 4" : undefined}
              strokeLinejoin="round"
            />
          ))}
        </g>
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--muted)" strokeWidth="1" />
        )}
        <rect
          x={pad.l}
          y={pad.t}
          width={W - pad.l - pad.r}
          height={H - pad.t - pad.b}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
    </div>
  );
}
