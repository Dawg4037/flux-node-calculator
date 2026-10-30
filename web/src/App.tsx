import { useMemo, type KeyboardEvent } from "react";
import { useNetwork, usePrice } from "./api.ts";
import { EarningsTab } from "./components/EarningsTab.tsx";
import { Header } from "./components/Header.tsx";
import { LookupTab } from "./components/LookupTab.tsx";
import { NetworkTable } from "./components/NetworkTable.tsx";
import { NextNodeTab } from "./components/NextNodeTab.tsx";
import { ProjectionsTab } from "./components/ProjectionsTab.tsx";
import { Contribute } from "./components/Contribute.tsx";
import { HowItWorksButton, HowItWorksProvider } from "./components/HowItWorks.tsx";
import { PrivacyButton } from "./components/Privacy.tsx";
import { AMAZON_STATEMENT, amazonDisclosureNeeded } from "./affiliates.ts";
import { Notice } from "./components/ui.tsx";
import { useLang } from "./i18n/index.tsx";
import { useTheme } from "./theme.ts";
import type { Market } from "./model.ts";
import { TABS, useAppState, withCurrencyExamples } from "./state.ts";
import type { Currency } from "../../shared/api.ts";

const REPO_URL = "https://github.com/Dawg4037/flux-node-calculator";

export function App() {
  const [state, update] = useAppState();
  const [theme, setTheme] = useTheme();
  // Reading the language here re-renders the whole page when it changes.
  const { lang, t } = useLang();
  const network = useNetwork();
  const price = usePrice();

  const market: Market | null = useMemo(
    () =>
      // The calculator runs on network data alone; without a price, currency amounts are hidden.
      network.data ? { network: network.data, price: price.data?.prices[state.currency] ?? null } : null,
    [network.data, price.data, state.currency],
  );

  // Example costs follow the currency (40 USD ≈ 670,000 IDR); costs the visitor typed are kept.
  const changeCurrency = (currency: Currency) => {
    const prices = price.data?.prices ?? null;
    update({
      currency,
      a: withCurrencyExamples(state.a, state.currency, currency, prices),
      b: withCurrencyExamples(state.b, state.currency, currency, prices),
    });
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length]!;
    update({ tab: next });
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <HowItWorksProvider network={network.data} state={state}>
    <div className="min-h-screen">
      <Header
        network={network.data}
        price={price.data}
        currency={state.currency}
        onCurrency={changeCurrency}
        theme={theme}
        onTheme={setTheme}
      />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        {network.error && !network.data && (
          <Notice tone="error">{t.app.networkError}</Notice>
        )}
        {price.error && !price.data && (
          <Notice tone="error">{t.app.priceError}</Notice>
        )}

        {network.data && <NetworkTable network={network.data} state={state} />}

        <section className="border-t border-line pt-6">
          <div role="tablist" aria-label={t.app.tablist} className="mb-8 flex gap-1 overflow-x-auto border-b border-line">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                role="tab"
                type="button"
                aria-selected={state.tab === tab}
                aria-controls={`panel-${tab}`}
                tabIndex={state.tab === tab ? 0 : -1}
                onKeyDown={(e) => onTabKey(e, i)}
                onClick={() => update({ tab })}
                className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-base whitespace-nowrap ${
                  state.tab === tab ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t.app.tabs[tab]}
              </button>
            ))}
          </div>

          <div id={`panel-${state.tab}`} role="tabpanel" aria-labelledby={`tab-${state.tab}`}>
            {state.tab === "lookup" ? (
              <LookupTab state={state} update={update} price={price.data?.prices[state.currency] ?? null} />
            ) : !market ? (
              <div className="h-64 animate-pulse rounded-md bg-line/30" aria-label={t.app.loading} />
            ) : state.tab === "earnings" ? (
              <EarningsTab state={state} update={update} market={market} />
            ) : state.tab === "next" ? (
              <NextNodeTab state={state} update={update} market={market} />
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
              {t.app.runsOnFlux}
            </a>
          </li>
          <li>
            {t.app.builtBy(
              <a className="underline" href="https://github.com/Dawg4037" rel="noopener noreferrer" target="_blank">
                Dawg4037
              </a>,
            )}
          </li>
          <li>
            <a className="underline" href={REPO_URL} rel="noopener noreferrer" target="_blank">
              {t.app.source}
            </a>
          </li>
          <li>
            <a className="underline" href={`${REPO_URL}/issues/new/choose`} rel="noopener noreferrer" target="_blank">
              {t.app.issue}
            </a>
          </li>
          {lang !== "en" && (
            <li>
              <a
                className="underline"
                href={`${REPO_URL}/issues/new?template=translation.yml`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t.app.translation}
              </a>
            </li>
          )}
          <li>
            <HowItWorksButton />
          </li>
          <li>
            <PrivacyButton />
          </li>
          <li className="num text-muted">v{__APP_VERSION__}</li>
        </ul>
        <p>
          {t.app.disclaimer}
        </p>
        {amazonDisclosureNeeded() && <p lang="en">{AMAZON_STATEMENT}</p>}
        <p>
          {t.app.credits(
            price.data?.source === "CoinGecko" ? (
              <a className="underline" href="https://www.coingecko.com/" rel="noopener noreferrer" target="_blank">
                CoinGecko
              </a>
            ) : (
              <>
                <a className="underline" href="https://explorer.runonflux.io/" rel="noopener noreferrer" target="_blank">
                  Flux explorer
                </a>{" "}
                ·{" "}
                <a className="underline" href="https://frankfurter.dev/" rel="noopener noreferrer" target="_blank">
                  Frankfurter (ECB)
                </a>
              </>
            ),
          )}
        </p>
        </div>
      </footer>
    </div>
    </HowItWorksProvider>
  );
}
