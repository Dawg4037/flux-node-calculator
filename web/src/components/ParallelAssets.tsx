import { useId } from "react";
import { DEFAULT_PARALLEL_ASSET_END, PARALLEL_ASSET_SHARE } from "../../../shared/rewards.ts";
import { fmtDay, fmtPct } from "../format.ts";
import { useT } from "../i18n/index.tsx";
import type { AppState } from "../state.ts";
import { NumberField, Toggle } from "./ui.tsx";

/** Short explanation shown wherever parallel-asset rewards are included. */
export function ParallelAssetsNote({ state }: { state: AppState }) {
  const t = useT().pa;
  if (!state.pa) return null;
  return (
    <div className="rounded-md border border-line p-3 text-sm text-muted">
      <p>{t.note(state.paCount, fmtPct(PARALLEL_ASSET_SHARE * 100, 0), fmtDay(state.paEnd))}</p>
      <p className="mt-2">{t.warning}</p>
    </div>
  );
}

export function ParallelAssetsSettings({ state, update }: { state: AppState; update: (p: Partial<AppState>) => void }) {
  const dateId = useId();
  const t = useT().pa;
  return (
    <div className="space-y-4">
      <Toggle
        label={t.include}
        checked={state.pa}
        onChange={(pa) => update({ pa })}
        hint={t.includeHint}
      />
      {state.pa && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t.active}
              integer
              min={0}
              max={20}
              value={state.paCount}
              onChange={(paCount) => update({ paCount })}
            />
            <NumberField
              label={t.value}
              suffix="%"
              min={0}
              max={200}
              value={state.paValue}
              onChange={(paValue) => update({ paValue })}
            />
          </div>
          <div>
            <label htmlFor={dateId} className="block text-sm text-muted">
              {t.endDate}
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
              {t.defaults(fmtDay(DEFAULT_PARALLEL_ASSET_END))} <span className="text-loss">{t.earlier}</span>
              {state.paEnd !== DEFAULT_PARALLEL_ASSET_END && (
                <>
                  {" "}
                  <button type="button" className="underline" onClick={() => update({ paEnd: DEFAULT_PARALLEL_ASSET_END })}>
                    {t.reset}
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
