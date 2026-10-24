import { useMemo, type KeyboardEvent } from "react";
import { useNetwork, usePrice } from "./api.ts";
import { EarningsTab } from "./components/EarningsTab.tsx";
import { Header } from "./components/Header.tsx";
import { LookupTab } from "./components/LookupTab.tsx";
import { NetworkTable } from "./components/NetworkTable.tsx";
import { ProjectionsTab } from "./components/ProjectionsTab.tsx";
import { Contribute } from "./components/Contribute.tsx";
import { Notice } from "./components/ui.tsx";
import { useTheme } from "./theme.ts";
import type { Market } from "./model.ts";
import { TABS, useAppState, type Tab } from "./state.ts";

const REPO_URL = "https://github.com/Dawg4037/flux-node-calculator";

const TAB_LABEL: Record<Tab, string> = {
  earnings: "Earnings and ROI",
  projections: "Projections",
  lookup: "Node lookup",
};

export function App() {
  const [state, update] = useAppState();
  const [theme, setTheme] = useTheme();
  const network = useNetwork();
  const price = usePrice();

  const market: Market | null = useMemo(
    () =>
      network.data && price.data ? { network: network.data, price: price.data.prices[state.currency] } : null,
    [network.data, price.data, state.currency],
  );

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length]!;
    update({ tab: next });
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <div className="min-h-screen">
      <Header
        network={network.data}
        price={price.data}
        currency={state.currency}
        onCurrency={(currency) => update({ currency })}
        theme={theme}
        onTheme={setTheme}
      />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        {network.error && !network.data && (
          <Notice tone="error">Can't reach the Flux network right now ({network.error}). Retrying.</Notice>
        )}
        {price.error && !price.data && (
          <Notice tone="error">Can't load the FLUX price right now ({price.error}). Retrying.</Notice>
        )}

        {network.data && <NetworkTable network={network.data} state={state} />}

        <section className="border-t border-line pt-6">
          <div role="tablist" aria-label="Calculator sections" className="mb-8 flex gap-1 overflow-x-auto border-b border-line">
            {TABS.map((t, i) => (
              <button
                key={t}
                id={`tab-${t}`}
                role="tab"
                type="button"
                aria-selected={state.tab === t}
                aria-controls={`panel-${t}`}
                tabIndex={state.tab === t ? 0 : -1}
                onKeyDown={(e) => onTabKey(e, i)}
                onClick={() => update({ tab: t })}
                className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-base whitespace-nowrap ${
                  state.tab === t ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>

          <div id={`panel-${state.tab}`} role="tabpanel" aria-labelledby={`tab-${state.tab}`}>
            {state.tab === "lookup" ? (
              <LookupTab state={state} update={update} price={price.data?.prices[state.currency] ?? null} />
            ) : !market ? (
              <div className="h-64 animate-pulse rounded-md bg-line/30" aria-label="Loading" />
            ) : state.tab === "earnings" ? (
              <EarningsTab state={state} update={update} market={market} />
            ) : (
              <ProjectionsTab state={state} update={update} market={market} />
            )}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="space-y-4 border-t border-line py-8 text-sm text-muted">
        <Contribute />
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-ink">
          <li>
            <a className="underline" href="https://runonflux.com/" rel="noopener noreferrer" target="_blank">
              Runs on Flux
            </a>
          </li>
          <li>
            Built by{" "}
            <a className="underline" href="https://github.com/Dawg4037" rel="noopener noreferrer" target="_blank">
              Dawg4037
            </a>
          </li>
          <li>
            <a className="underline" href={REPO_URL} rel="noopener noreferrer" target="_blank">
              Source on GitHub
            </a>
          </li>
          <li>
            <a className="underline" href={`${REPO_URL}/issues/new/choose`} rel="noopener noreferrer" target="_blank">
              Report an issue or suggest a feature
            </a>
          </li>
          <li className="num text-muted">v{__APP_VERSION__}</li>
        </ul>
        <p>
          Independent community tool, not affiliated with Flux. Estimates only, not financial advice. Progressive Node
          Rewards (FluxCloud revenue share) aren't included because no formula has been published. Rewards assume your
          nodes stay confirmed.
        </p>
        <p>
          Price data by{" "}
          <a className="underline" href="https://www.coingecko.com/" rel="noopener noreferrer" target="_blank">
            CoinGecko
          </a>
          . Network data from the Flux API. Open source under the MIT license.
        </p>
        </div>
      </footer>
    </div>
  );
}
