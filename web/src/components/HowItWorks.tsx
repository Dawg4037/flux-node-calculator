import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { NetworkResponse } from "../../../shared/api.ts";
import {
  BLOCKS_PER_DAY,
  BLOCKS_PER_MONTH,
  BLOCKS_PER_YEAR,
  COLLATERAL,
  DEFAULT_PARALLEL_ASSET_END,
  PARALLEL_ASSET_SHARE,
  REDUCTION_INTERVAL,
  SCHEDULE_START_HEIGHT,
  dailyFluxPerNode,
  fluxAprPct,
} from "../../../shared/rewards.ts";
import { fmtDay, fmtDuration, fmtFlux, fmtInt, fmtPct } from "../format.ts";
import { useT } from "../i18n/index.tsx";
import type { AppState } from "../state.ts";

/** Lets any button on the page open the explainer. */
const OpenContext = createContext<() => void>(() => {});
export const useOpenHowItWorks = () => useContext(OpenContext);

export function HowItWorksButton({ className = "" }: { className?: string }) {
  const open = useOpenHowItWorks();
  const label = useT().how.button;
  return (
    <button type="button" onClick={open} className={`underline ${className}`}>
      {label}
    </button>
  );
}

/** Explains every calculation, with today's numbers as the worked examples. */
function Explainer({ network, state }: { network: NetworkResponse | null; state: AppState }) {
  const t = useT();
  const h = network?.height ?? SCHEDULE_START_HEIGHT;
  const stratusNodes = network?.nodes.stratus ?? 0;
  return (
    <div className="max-w-prose space-y-2 text-ink">
      {t.how.body({
        live: network !== null,
        blocksPerDay: fmtInt(BLOCKS_PER_DAY),
        stratusReward: fmtFlux(network?.rewardPerBlock.stratus ?? 0),
        stratusNodes: fmtInt(stratusNodes),
        stratusDaily: network ? fmtFlux(dailyFluxPerNode("stratus", h, stratusNodes)) : "",
        stratusEvery: fmtDuration(stratusNodes * 30_000),
        startHeight: fmtInt(SCHEDULE_START_HEIGHT),
        interval: fmtInt(REDUCTION_INTERVAL),
        totalReward: fmtFlux(network?.totalBlockReward ?? 0),
        nextCut: fmtInt(network?.nextReductionHeight ?? 0),
        blocksPerMonth: fmtInt(BLOCKS_PER_MONTH),
        blocksPerYear: fmtInt(BLOCKS_PER_YEAR),
        cumulus: fmtInt(COLLATERAL.cumulus),
        nimbus: fmtInt(COLLATERAL.nimbus),
        stratus: fmtInt(COLLATERAL.stratus),
        stratusApr: network ? fmtPct(fluxAprPct("stratus", h, stratusNodes)) : "",
        paShare: fmtPct(PARALLEL_ASSET_SHARE * 100, 0),
        paCount: state.paCount,
        paTotal: fmtPct(state.paCount * PARALLEL_ASSET_SHARE * 100, 0),
        paEnd: fmtDay(DEFAULT_PARALLEL_ASSET_END),
      })}
    </div>
  );
}

/** Provides the "open" action and renders the dialog once for the whole page. */
export function HowItWorksProvider({
  network,
  state,
  children,
}: {
  network: NetworkResponse | null;
  state: AppState;
  children: ReactNode;
}) {
  const t = useT().how;
  const ref = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  return (
    <OpenContext.Provider value={() => setIsOpen(true)}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="how-title"
        onClose={() => setIsOpen(false)}
        onClick={(e) => {
          // Clicking the dimmed backdrop closes it.
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
        className="m-auto max-h-[90vh] w-[min(46rem,calc(100vw-2rem))] rounded-lg border border-line bg-paper p-0 text-ink backdrop:bg-black/50"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-paper px-5 py-4">
          <h2 id="how-title" className="text-xl font-semibold tracking-tight">
            {t.button}
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-line px-3 py-1 text-sm"
            autoFocus
          >
            {t.close}
          </button>
        </div>
        <div className="px-5 py-5">{isOpen && <Explainer network={network} state={state} />}</div>
      </dialog>
    </OpenContext.Provider>
  );
}
