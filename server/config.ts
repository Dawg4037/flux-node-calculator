/** Server configuration from environment variables, with safe bounds. */

function num(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function bool(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return raw === "1" || raw === "true" || raw === "yes";
}

function url(name: string, fallback: string): string {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return fallback;
    return u.toString().replace(/\/+$/, "");
  } catch {
    return fallback;
  }
}

export interface Config {
  port: number;
  host: string;
  fluxApiBaseUrl: string;
  coingeckoApiKey: string;
  coingeckoBaseUrl: string;
  priceRefreshMs: number;
  networkRefreshMs: number;
  fluxMaxConcurrency: number;
  lookupRatePerMinute: number;
  trustProxy: boolean;
  staticDir: string;
  /** Release version, baked in at build time. */
  version: string;
}

export function loadConfig(): Config {
  return {
    port: num("PORT", 8080, 1, 65535),
    host: process.env.HOST?.trim() || "0.0.0.0",
    fluxApiBaseUrl: url("FLUX_API_BASE_URL", "https://api.runonflux.io"),
    coingeckoApiKey: process.env.COINGECKO_API_KEY?.trim() ?? "",
    coingeckoBaseUrl: url("COINGECKO_BASE_URL", "https://api.coingecko.com/api/v3"),
    // Never faster than every 5 minutes, to protect the free-tier quota.
    priceRefreshMs: num("PRICE_REFRESH_MINUTES", 20, 5, 1440) * 60_000,
    networkRefreshMs: num("NETWORK_REFRESH_SECONDS", 90, 30, 3600) * 1000,
    fluxMaxConcurrency: num("FLUX_MAX_CONCURRENCY", 2, 1, 5),
    lookupRatePerMinute: num("LOOKUP_RATE_PER_MINUTE", 10, 1, 120),
    trustProxy: bool("TRUST_PROXY", true),
    staticDir: process.env.STATIC_DIR?.trim() || "dist/public",
    version: process.env.APP_VERSION ?? "dev",
  };
}
