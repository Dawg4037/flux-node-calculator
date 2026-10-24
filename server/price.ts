/** FLUX price from CoinGecko, refreshed on a timer and served from memory. */
import { CURRENCIES, type Currency, type PriceResponse } from "../shared/api.ts";
import { fetchJson, type FetchFn } from "./upstream.ts";

const COIN_ID = "zelcash"; // CoinGecko's id for FLUX (verified Oct 2026)

export class PriceClient {
  private price: PriceResponse | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly fetchFn: FetchFn,
    private readonly log: { warn: (o: object, m: string) => void },
  ) {}

  getPrice(): PriceResponse | null {
    return this.price;
  }

  async refresh(): Promise<void> {
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
    } catch (err) {
      if (this.price) this.price = { ...this.price, stale: true };
      this.log.warn({ err: (err as Error).message }, "price refresh failed");
    }
  }
}
