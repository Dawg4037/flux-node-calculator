/** FLUX price from CoinGecko, refreshed on a timer and served from memory. */
import { CURRENCIES, type Currency, type PriceResponse } from "../shared/api.ts";
import { UpstreamError, fetchJson, type FetchFn } from "./upstream.ts";

const COIN_ID = "zelcash"; // CoinGecko's id for FLUX (verified Oct 2026)

/** After a failed refresh, retry in 2, 4, 8, 16 minutes… up to the normal interval. */
const FIRST_RETRY_MS = 2 * 60_000;

/** A short, safe description of why a refresh failed (never includes the URL or key). */
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

export class PriceClient {
  private price: PriceResponse | null = null;
  private failures = 0;
  private lastError: string | null = null;
  private lastAttemptAt: string | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly fetchFn: FetchFn,
    private readonly log: { warn: (o: object, m: string) => void },
  ) {}

  getPrice(): PriceResponse | null {
    return this.price;
  }

  /** For /api/health: whether a key is set (never the key) and the last failure, if any. */
  status() {
    return {
      keySet: this.apiKey !== "",
      lastAttemptAt: this.lastAttemptAt,
      lastError: this.lastError,
      failuresInARow: this.failures,
    };
  }

  /** Wait before the next refresh: the normal interval after a success, shorter after failures. */
  nextDelayMs(normalMs: number): number {
    if (this.failures === 0) return normalMs;
    return Math.min(normalMs, FIRST_RETRY_MS * 2 ** (this.failures - 1));
  }

  async refresh(): Promise<void> {
    this.lastAttemptAt = new Date().toISOString();
    try {
      const url =
        `${this.baseUrl}/simple/price?ids=${COIN_ID}` +
        `&vs_currencies=${CURRENCIES.join(",")}&include_last_updated_at=true`;
      const headers: Record<string, string> = this.apiKey ? { "x-cg-demo-api-key": this.apiKey } : {};
      // No retry: a failed refresh waits for the next interval, protecting the monthly quota.
      const body = await fetchJson(this.fetchFn, url, { headers, retries: 0, timeoutMs: 10_000 });
      const coin = (body as Record<string, Record<string, unknown>> | null)?.[COIN_ID];
      if (!coin) throw new Error("Price missing from response");

      const prices = {} as Record<Currency, number>;
      for (const c of CURRENCIES) {
        const v = coin[c];
        if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) throw new Error(`Bad ${c} price`);
        prices[c] = v;
      }
      const updated = coin.last_updated_at;
      this.price = {
        prices,
        updatedAt: typeof updated === "number" ? new Date(updated * 1000).toISOString() : null,
        stale: false,
        source: "CoinGecko",
      };
      this.failures = 0;
      this.lastError = null;
    } catch (err) {
      this.failures++;
      this.lastError = describePriceError(err);
      if (this.price) this.price = { ...this.price, stale: true };
      this.log.warn({ err: this.lastError }, "price refresh failed");
    }
  }
}
