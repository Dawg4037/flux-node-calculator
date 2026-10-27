import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { NetworkResponse } from "../../../shared/api.ts";
import {
  BLOCKS_PER_DAY,
  BLOCKS_PER_MONTH,
  BLOCKS_PER_YEAR,
  COLLATERAL,
  PARALLEL_ASSET_SHARE,
  REDUCTION_INTERVAL,
  SCHEDULE_START_HEIGHT,
  dailyFluxPerNode,
  fluxAprPct,
} from "../../../shared/rewards.ts";
import { fmtDuration, fmtFlux, fmtInt, fmtPct } from "../format.ts";
import type { AppState } from "../state.ts";

/** Lets any button on the page open the explainer. */
const OpenContext = createContext<() => void>(() => {});
export const useOpenHowItWorks = () => useContext(OpenContext);

export function HowItWorksButton({ className = "" }: { className?: string }) {
  const open = useOpenHowItWorks();
  return (
    <button type="button" onClick={open} className={`underline ${className}`}>
      How the math works
    </button>
  );
}

function H({ children }: { children: ReactNode }) {
  return <h3 className="mt-6 text-lg font-semibold tracking-tight first:mt-0">{children}</h3>;
}

function Formula({ children }: { children: ReactNode }) {
  return <p className="num my-2 rounded-md border border-line bg-surface px-3 py-2 text-sm">{children}</p>;
}

/** Explains every calculation, with today's numbers as the worked examples. */
function Explainer({ network, state }: { network: NetworkResponse | null; state: AppState }) {
  const h = network?.height ?? SCHEDULE_START_HEIGHT;
  const stratusNodes = network?.nodes.stratus ?? 0;
  const stratusReward = network?.rewardPerBlock.stratus ?? 0;
  const stratusDaily = network ? dailyFluxPerNode("stratus", h, stratusNodes) : 0;
  const stratusApr = network ? fluxAprPct("stratus", h, stratusNodes) : 0;

  return (
    <div className="max-w-prose space-y-2 text-ink">
      <H>Where the numbers come from</H>
      <p>
        Block height, enabled nodes per tier, and the DOS and start lists come from the Flux network API, refreshed about
        every 90 seconds. The FLUX price comes from CoinGecko, refreshed every 20 minutes. Everything else is calculated
        from those.
      </p>

      <H>Blocks and payouts</H>
      <p>
        A block is made every 30 seconds, so {fmtInt(BLOCKS_PER_DAY)} a day. Every block pays one node in each tier, taking
        turns in a queue. A node's share depends only on how many enabled nodes are in its tier.
      </p>
      <Formula>FLUX per node per day = tier reward per block × 2,880 ÷ enabled nodes in the tier</Formula>
      {network && (
        <p className="text-sm text-muted">
          Today for Stratus: {fmtFlux(stratusReward)} × 2,880 ÷ {fmtInt(stratusNodes)} = {fmtFlux(stratusDaily)} FLUX a
          day, paid about every {fmtDuration(stratusNodes * 30_000)} ({fmtInt(stratusNodes)} nodes × 30 seconds).
        </p>
      )}

      <H>The reward schedule</H>
      <p>
        The total reward was 14 FLUX per block from block {fmtInt(SCHEDULE_START_HEIGHT)}. It drops 10% every{" "}
        {fmtInt(REDUCTION_INTERVAL)} blocks (365 days). It's split between tiers in fixed shares: Cumulus 1/14, Nimbus
        3.5/14, Stratus 9/14, and 0.5/14 to the Flux Foundation. These match the chain's own figures at every height we
        checked.
      </p>
      {network && (
        <p className="text-sm text-muted">
          Right now: {fmtFlux(network.totalBlockReward)} FLUX a block. Next 10% cut at block{" "}
          {fmtInt(network.nextReductionHeight)}.
        </p>
      )}

      <H>Months and years</H>
      <p>
        A month is the average calendar month, 30.44 days ({fmtInt(BLOCKS_PER_MONTH)} blocks), so 12 months make exactly
        one year of 365.25 days ({fmtInt(BLOCKS_PER_YEAR)} blocks). Whenever a period crosses a reward cut, blocks before
        the cut pay the old reward and blocks after pay the new one.
      </p>

      <H>Yearly reward rate</H>
      <Formula>Yearly reward rate = FLUX earned over the next 12 months ÷ collateral</Formula>
      <p>
        It includes any reward cut in those 12 months and doesn't compound. Collateral is{" "}
        {fmtInt(COLLATERAL.cumulus)} FLUX for Cumulus, {fmtInt(COLLATERAL.nimbus)} for Nimbus and{" "}
        {fmtInt(COLLATERAL.stratus)} for Stratus.
      </p>
      {network && (
        <p className="text-sm text-muted">Today for Stratus, native FLUX only: {fmtPct(stratusApr)}.</p>
      )}

      <H>Parallel assets</H>
      <p>
        Each active parallel asset pays an extra {fmtPct(PARALLEL_ASSET_SHARE * 100, 0)} of every payout, in FLUX on
        another chain. With {state.paCount} active, that's {state.paCount * 10}% on top of native rewards. They're counted
        until the end date you set (default January 1, 2028, which will likely come earlier) and at the value you set
        relative to native FLUX. They aren't paid automatically: each one is claimed in Zelcore, and each claim costs a
        network fee, which isn't included.
      </p>

      <H>Earnings, costs and break-even</H>
      <Formula>Net per month = (native FLUX + parallel assets) × price − running costs</Formula>
      <Formula>Break-even = first month where total net profit ≥ setup cost (+ collateral, if counted)</Formula>
      <p>
        Collateral is valued at the price you paid for it, or today's price. Break-even uses today's price and network
        size, and the rewards still fall with each yearly cut.
      </p>

      <H>Projections</H>
      <p>
        Worked out month by month. Network size and price change compound monthly from the yearly rates you choose,
        measured at the middle of each month. A growing network means each node is paid less often. The low, middle and
        high price figures are your assumptions, not forecasts.
      </p>

      <H>Next node</H>
      <Formula>Saved per month = rewards (+ parallel assets) − FLUX sold to pay running costs</Formula>
      <p>
        When savings reach a tier's collateral, a node is bought. If you keep reinvesting, the new node earns from the
        following month and adds its running cost. Hardware and setup for new nodes aren't included.
      </p>

      <H>Node lookup</H>
      <p>
        Nodes are found by exact payment address. Next payout is the node's place in its tier's queue × 30 seconds.
        "Received" is the last 30 days of native FLUX payouts from block rewards, matched by amount to a tier. "Expected"
        is what the address's current nodes should have earned over the same period at today's network size, so it reads
        high or low if nodes were added or removed during the month. DOS and starting nodes come from Flux's own lists.
      </p>

      <H>Not included</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>Progressive Node Rewards (FluxCloud revenue share). No formula has been published.</li>
        <li>Parallel-asset claim fees, and taxes.</li>
        <li>Downtime. Rewards assume your nodes stay confirmed.</li>
      </ul>
      <p className="pt-2 text-sm text-muted">
        The full source is on GitHub, including tests that check the reward schedule against the live chain.
      </p>
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
            How the math works
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-line px-3 py-1 text-sm"
            autoFocus
          >
            Close
          </button>
        </div>
        <div className="px-5 py-5">{isOpen && <Explainer network={network} state={state} />}</div>
      </dialog>
    </OpenContext.Provider>
  );
}
