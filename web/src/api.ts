import { useEffect, useState } from "react";
import type { LookupResponse, NetworkResponse, PriceResponse } from "../../shared/api.ts";

/** A failed API call. The page shows its own translated message based on `status`. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  if (!body) throw new ApiError("Empty response", res.status);
  return body;
}

/** Polls an endpoint, keeping the last good value if a refresh fails. */
function usePolled<T>(url: string, intervalMs: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    let loaded = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const value = await getJson<T>(url);
        if (!cancelled) {
          loaded = true;
          setData(value);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
      // Retry sooner while nothing has loaded yet.
      if (!cancelled) timer = setTimeout(load, loaded ? intervalMs : 10_000);
    };
    void load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [url, intervalMs]);
  return { data, error };
}

export const useNetwork = () => usePolled<NetworkResponse>("/api/network", 60_000);
export const usePrice = () => usePolled<PriceResponse>("/api/price", 5 * 60_000);

export const lookupAddress = (address: string) =>
  getJson<LookupResponse>(`/api/lookup/${encodeURIComponent(address)}`);
