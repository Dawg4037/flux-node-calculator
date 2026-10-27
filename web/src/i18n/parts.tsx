/** Small building blocks the message catalogs use for formatted text. */
import type { ReactNode } from "react";

export type N = ReactNode;

/** A number or value set in the tabular figure style. */
export const Num = ({ children, strong = false }: { children: N; strong?: boolean }) => (
  <span className={`num ${strong ? "font-semibold" : ""}`}>{children}</span>
);

/** Section heading inside the "How the math works" dialog. */
export const H = ({ children }: { children: N }) => (
  <h3 className="mt-6 text-lg font-semibold tracking-tight first:mt-0">{children}</h3>
);

/** A formula on its own line. */
export const Formula = ({ children }: { children: N }) => (
  <p className="num my-2 rounded-md border border-line bg-surface px-3 py-2 text-sm">{children}</p>
);

/** A worked example with today's numbers. */
export const Example = ({ children }: { children: N }) => <p className="text-sm text-muted">{children}</p>;

/** Formatted values for the "How the math works" text. All already formatted for the reader's language. */
export interface HowValues {
  live: boolean;
  blocksPerDay: string;
  stratusReward: string;
  stratusNodes: string;
  stratusDaily: string;
  stratusEvery: string;
  startHeight: string;
  interval: string;
  totalReward: string;
  nextCut: string;
  blocksPerMonth: string;
  blocksPerYear: string;
  cumulus: string;
  nimbus: string;
  stratus: string;
  stratusApr: string;
  paShare: string;
  paCount: number;
  paTotal: string;
  paEnd: string;
}

/** Words the number and date helpers in format.ts need. */
export interface FormatWords {
  now: string;
  immediately: string;
  days: (n: number) => string;
  hours: (n: number) => string;
  minutes: (n: number) => string;
  seconds: (n: number) => string;
  /** Years and months in the form used after "after"/"in" (German needs the dative). */
  years: (n: number) => string;
  months: (n: number) => string;
  /** Joins "2 years" and "3 months". */
  and: string;
  future: (d: string) => string;
  past: (d: string) => string;
}
