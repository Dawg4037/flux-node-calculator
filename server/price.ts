/**
 * FLUX price, refreshed on a timer and served from memory.
 *
 * 1. FLUX in USD from the Flux explorer (primary host, then backup). No key, no quota.
 * 2. Other currencies by converting with the European Central Bank's daily rates (Frankfurter).
 *    Those rates change once a day, so they are fetched every few hours and reused if a fetch fails.
 * 3. If either step fails, CoinGecko gives all currencies in one call (uses the Demo key if set).
 */
import { CURRENCIES, type Currency, type PriceResponse, type PriceSource } from "../shared/api.ts";
import { UpstreamError, fetchJson, type FetchFn } from "./upstream.ts";

const COIN_ID = "zelcash"; // CoinGecko's id for FLUX (verified Oct 2026)

/** After a failed refresh, retry in 2, 4, 8, 16 minutes… up to the normal interval. */
const FIRST_RETRY_MS = 2 * 60_000;
/** Exchange rates are daily; refresh them at most this often… */
const FX_REFRESH_MS = 6 * 60 * 60_000;
/** …and keep using the last ones for this long if Frankfurter is down. */
const FX_MAX_AGE_MS = 3 * 24 * 60 * 60_000;

type OtherCurrency = Exclude<Currency, "usd">;
const OTHER_CURRENCIES = CURRENCIES.filter((c): c is OtherCurrency => c !== "usd");

export interface PriceSources {
  explorerUrls: string[];
  frankfurterBaseUrl: string;
  coingeckoBaseUrl: string;
  coingeckoApiKey: string;
}

/** A short, safe description of why a request failed (never includes the URL or key). */
export function describePriceError(err: unknown): string {
  if (err instanceof UpstreamError) return err.status ? `HTTP ${err.status}` : err.message;
  if (err instanceof Error) {
    if (err.name === "TimeoutError" || err.name === "AbortError") return "timeout";
    const cause = (err as Error & { cause?: { code?: unknown; errors?: Array<{ code?: unknown }> } }).cause;
    const code = cause?.code ?? cause?.errors?.[0]?.code;
    if (typeof code === "string") return `network error (${code})`;
    // e.g. "connect ETIMEDOUT 1.2.3.4:443". Never echo anything that could hold a URL or header.
    const detail = (cause as { message?: unknown } | undefined)?.message;
    if (typeof detail === "string" && detail.length <= 80 && !/[?/=]/.test(detail)) return `network error (${detail})`;
    if (err.message.startsWith("Bad ") || err.message.startsWith("Price missing")) return err.message;
    return "network error";
  }
  return "unknown error";
}

const positive = (v: unknown, max = 1e9): v is number => typeof v === "number" && Number.isFinite(v) && v > 0 && v < max;

export class PriceClient {
  private price: PriceResponse | null = null;
  private fx: { rates: Record<OtherCurrency, number>; date: string | null; fetchedAt: number } | null = null;
  private failures = 0;
  private lastError: string | null = null;
  private lastAttemptAt: string | null = null;
  /** Last error per source, so /api/health shows why a fallback was used. */
  private errors: { explorer: string | null; frankfurter: string | null; coingecko: string | null } = {
    explorer: null,
    frankfurter: null,
    coingecko: null,
  };

  constructor(
    private readonly sources: PriceSources,
    private readonly fetchFn: FetchFn,
    private readonly log: { warn: (o: object, m: string) => void },
  ) {}

  getPrice(): PriceResponse | null {
    return this.price;
  }

  /** For /api/health: where the price came from, whether a CoinGecko key is set (never the key), and errors. */
  status() {
    return {
      source: this.price?.source ?? null,
      keySet: this.sources.coingeckoApiKey !== "",
      lastAttemptAt: this.lastAttemptAt,
      lastError: this.lastError,
      failuresInARow: this.failures,
      errors: { ...this.errors },
    };
  }

  /** Wait before the next refresh: the normal interval after a success, shorter after failures. */
  nextDelayMs(normalMs: number): number {
    if (this.failures === 0) return normalMs;
    return Math.min(normalMs, FIRST_RETRY_MS * 2 ** (this.failures - 1));
  }

  async refresh(): Promise<void> {
    this.lastAttemptAt = new Date().toISOString();
    const next = (await this.fromExplorer()) ?? (await this.fromCoinGecko());
    if (next) {
      this.price = next;
      this.failures = 0;
      this.lastError = null;
      return;
    }
    this.failures++;
    this.lastError = [
      this.errors.explorer && `explorer: ${this.errors.explorer}`,
      this.errors.frankfurter && `frankfurter: ${this.errors.frankfurter}`,
      this.errors.coingecko && `coingecko: ${this.errors.coingecko}`,
    ]
      .filter(Boolean)
      .join("; ");
    if (this.price) this.price = { ...this.price, stale: true };
    this.log.warn({ err: this.lastError }, "price refresh failed");
  }

  /** USD from the Flux explorer, other currencies via exchange rates. Null if either part is missing. */
  private async fromExplorer(): Promise<PriceResponse | null> {
    const usd = await this.explorerUsd();
    if (usd === null) return null;
    const fx = await this.exchangeRates();
    if (!fx) return null;
    const prices = { usd } as Record<Currency, number>;
    for (const c of OTHER_CURRENCIES) prices[c] = usd * fx.rates[c];
    return { prices, updatedAt: new Date().toISOString(), stale: false, source: "Flux explorer", fxDate: fx.date };
  }

  private async explorerUsd(): Promise<number | null> {
    let lastErr: unknown = null;
    for (const base of this.sources.explorerUrls) {
      try {
        const body = (await fetchJson(this.fetchFn, `${base}/api/currency`, { retries: 0, timeoutMs: 8_000 })) as {
          data?: { rate?: unknown };
        } | null;
        const rate = body?.data?.rate;
        // FLUX has never been above $10; anything far outside that is a bad response.
        if (!positive(rate, 1000)) throw new Error("Bad usd price");
        this.errors.explorer = null;
        return rate;
      } catch (err) {
        lastErr = err;
      }
    }
    this.errors.explorer = describePriceError(lastErr);
    return null;
  }

  private async exchangeRates() {
    const now = Date.now();
    if (this.fx && now - this.fx.fetchedAt < FX_REFRESH_MS) return this.fx;
    try {
      const symbols = OTHER_CURRENCIES.map((c) => c.toUpperCase()).join(",");
      const body = (await fetchJson(this.fetchFn, `${this.sources.frankfurterBaseUrl}/v1/latest?base=USD&symbols=${symbols}`, {
        retries: 1,
        timeoutMs: 8_000,
      })) as { rates?: Record<string, unknown>; date?: unknown } | null;
      const rates = {} as Record<OtherCurrency, number>;
      for (const c of OTHER_CURRENCIES) {
        const v = body?.rates?.[c.toUpperCase()];
        if (!positive(v)) throw new Error(`Bad ${c} price`);
        rates[c] = v;
      }
      this.fx = { rates, date: typeof body?.date === "string" ? body.date : null, fetchedAt: now };
      this.errors.frankfurter = null;
    } catch (err) {
      this.errors.frankfurter = describePriceError(err);
      // Daily rates barely move; yesterday's are fine for a while.
      if (this.fx && now - this.fx.fetchedAt < FX_MAX_AGE_MS) return this.fx;
      return null;
    }
    return this.fx;
  }

  private async fromCoinGecko(): Promise<PriceResponse | null> {
    try {
      const url =
        `${this.sources.coingeckoBaseUrl}/simple/price?ids=${COIN_ID}` +
        `&vs_currencies=${CURRENCIES.join(",")}&include_last_updated_at=true`;
      const key = this.sources.coingeckoApiKey;
      const headers: Record<string, string> = key ? { "x-cg-demo-api-key": key } : {};
      // No retry: protects the monthly quota.
      const body = await fetchJson(this.fetchFn, url, { headers, retries: 0, timeoutMs: 10_000 });
      const coin = (body as Record<string, Record<string, unknown>> | null)?.[COIN_ID];
      if (!coin) throw new Error("Price missing from response");
      const prices = {} as Record<Currency, number>;
      for (const c of CURRENCIES) {
        const v = coin[c];
        if (!positive(v)) throw new Error(`Bad ${c} price`);
        prices[c] = v;
      }
      const updated = coin.last_updated_at;
      this.errors.coingecko = null;
      const source: PriceSource = "CoinGecko";
      return {
        prices,
        updatedAt: typeof updated === "number" ? new Date(updated * 1000).toISOString() : null,
        stale: false,
        source,
        fxDate: null,
      };
    } catch (err) {
      this.errors.coingecko = describePriceError(err);
      return null;
    }
  }
}
