import type { Currency } from "../../shared/api.ts";
import type { FormatWords } from "./i18n/parts.tsx";

let locale: string | undefined;
let words: FormatWords = {
  now: "now",
  immediately: "immediately",
  days: (n) => `${n}d`,
  hours: (n) => `${n}h`,
  minutes: (n) => `${n}m`,
  seconds: (n) => `${n}s`,
  years: (n) => `${n} ${n === 1 ? "year" : "years"}`,
  months: (n) => `${n} ${n === 1 ? "month" : "months"}`,
  and: " ",
  future: (d) => `in ${d}`,
  past: (d) => `${d} ago`,
};

const cache = new Map<string, Intl.NumberFormat>();

/** Called by the language provider: sets the locale for numbers and dates and the words for durations. */
export function setFormatLanguage(nextLocale: string, nextWords: FormatWords) {
  if (nextLocale !== locale) cache.clear();
  locale = nextLocale;
  words = nextWords;
}

/** Locale in use for numbers and dates (undefined = browser default). */
export const currentLocale = () => locale;

const nf = (key: string, opts: Intl.NumberFormatOptions) => {
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, opts);
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

/** FLUX price: 4 decimals for $0.0681, none for Rp 1,107. */
/** Short money for chart axes: "$1.2K", "Rp 40 jt", "-€3K". */
export const fmtMoneyShort = (n: number, currency: Currency) =>
  nf(`ms-${currency}`, {
    style: "currency",
    currency: currency.toUpperCase(),
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const fmtPrice = (n: number, currency: Currency) => {
  const digits = Math.abs(n) >= 1000 ? 0 : Math.abs(n) >= 1 ? 2 : 4;
  return nf(`p-${currency}-${digits}`, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
};

export const fmtPct = (n: number, digits = 1) => `${nf(`pct${digits}`, { maximumFractionDigits: digits }).format(n)}%`;

export function fmtDuration(ms: number): string {
  if (ms <= 0) return words.now;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${words.days(d)} ${words.hours(h)} ${words.minutes(m)}`;
  if (h > 0) return `${words.hours(h)} ${words.minutes(m)}`;
  if (m > 0) return `${words.minutes(m)} ${words.seconds(s % 60)}`;
  return words.seconds(s);
}

export function fmtMonths(months: number): string {
  if (months <= 0) return words.immediately;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(words.years(y));
  if (m) parts.push(words.months(m));
  return parts.join(words.and);
}

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }) : "—";

/** A calendar day given as YYYY-MM-DD, e.g. "January 1, 2028". */
export const fmtDay = (isoDay: string) =>
  new Date(`${isoDay}T00:00:00Z`).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

/** Month and year, e.g. "Oct 2027". */
export const fmtMonthYear = (ms: number) => new Date(ms).toLocaleDateString(locale, { month: "short", year: "numeric" });

export const fmtRelative = (iso: string | null, now = Date.now()) => {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - now;
  if (Math.abs(diff) < 1000) return words.now;
  return diff >= 0 ? words.future(fmtDuration(diff)) : words.past(fmtDuration(-diff));
};
