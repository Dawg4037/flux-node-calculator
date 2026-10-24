import type { Currency } from "../../shared/api.ts";

const cache = new Map<string, Intl.NumberFormat>();
const nf = (key: string, opts: Intl.NumberFormatOptions) => {
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(undefined, opts);
    cache.set(key, f);
  }
  return f;
};

export const fmtInt = (n: number) => nf("int", { maximumFractionDigits: 0 }).format(n);

export const fmtFlux = (n: number) => {
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 4;
  return nf(`flux${digits}`, { maximumFractionDigits: digits, minimumFractionDigits: Math.min(digits, 2) }).format(n);
};

export const fmtMoney = (n: number, currency: Currency) => {
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 0 : 2;
  return nf(`m-${currency}-${digits}`, {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
};

export const fmtPrice = (n: number, currency: Currency) =>
  nf(`p-${currency}`, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(n);

export const fmtPct = (n: number, digits = 1) => `${nf(`pct${digits}`, { maximumFractionDigits: digits }).format(n)}%`;

export function fmtDuration(ms: number): string {
  if (ms <= 0) return "now";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function fmtMonths(months: number): string {
  if (months <= 0) return "immediately";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} ${y === 1 ? "year" : "years"}`);
  if (m) parts.push(`${m} ${m === 1 ? "month" : "months"}`);
  return parts.join(" ");
}

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

export const fmtRelative = (iso: string | null, now = Date.now()) => {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - now;
  return diff >= 0 ? `in ${fmtDuration(diff)}` : `${fmtDuration(-diff)} ago`;
};
