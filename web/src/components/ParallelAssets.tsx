import { useId } from "react";
import { DEFAULT_PARALLEL_ASSET_END, PARALLEL_ASSET_SHARE } from "../../../shared/rewards.ts";
import { fmtPct } from "../format.ts";
import type { AppState } from "../state.ts";
import { NumberField, Toggle } from "./ui.tsx";

const fmtDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

/** Short explanation shown wherever parallel-asset rewards are included. */
export function ParallelAssetsNote({ state }: { state: AppState }) {
  if (!state.pa) return null;
  return (
    <div className="rounded-md border border-line p-3 text-sm text-muted">
      <p>
        Includes parallel asset rewards: FLUX paid on {state.paCount} other chains, each adding{" "}
        {fmtPct(PARALLEL_ASSET_SHARE * 100, 0)} of every payout, until {fmtDay(state.paEnd)}.{" "}
        <strong className="font-medium text-ink">They aren't paid automatically.</strong> You claim each one in Zelcore
        (Apps → Fusion → Parallel Mining Claim), and every claim costs a network fee.
      </p>
      <p className="mt-2">
        <strong className="font-medium text-loss">The end date will likely come earlier.</strong> Flux projects parallel
        assets running out around 2028, but no fixed date has been published. Treat earnings after the next year or two as
        optimistic.
      </p>
    </div>
  );
}

export function ParallelAssetsSettings({ state, update }: { state: AppState; update: (p: Partial<AppState>) => void }) {
  const dateId = useId();
  return (
    <div className="space-y-4">
      <Toggle
        label="Include parallel asset rewards"
        checked={state.pa}
        onChange={(pa) => update({ pa })}
        hint="Extra FLUX paid on other chains while they last. Must be claimed."
      />
      {state.pa && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Active assets"
              integer
              min={0}
              max={20}
              value={state.paCount}
              onChange={(paCount) => update({ paCount })}
            />
            <NumberField
              label="Value vs. native FLUX"
              suffix="%"
              min={0}
              max={200}
              value={state.paValue}
              onChange={(paValue) => update({ paValue })}
            />
          </div>
          <div>
            <label htmlFor={dateId} className="block text-sm text-muted">
              Projected end date
            </label>
            <input
              id={dateId}
              type="date"
              value={state.paEnd}
              min="2026-01-01"
              max="2035-12-31"
              onChange={(e) => e.target.value && update({ paEnd: e.target.value })}
              className="num mt-1 w-full rounded-md border border-line bg-field px-3 py-2 text-ink outline-none focus:border-nimbus"
            />
            <p className="mt-1 text-xs text-muted">
              Defaults to {fmtDay(DEFAULT_PARALLEL_ASSET_END)} from Flux's projection.{" "}
              <span className="text-loss">Likely to be earlier.</span>
              {state.paEnd !== DEFAULT_PARALLEL_ASSET_END && (
                <>
                  {" "}
                  <button type="button" className="underline" onClick={() => update({ paEnd: DEFAULT_PARALLEL_ASSET_END })}>
                    Reset
                  </button>
                </>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
