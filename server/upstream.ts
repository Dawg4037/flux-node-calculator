/** Outbound HTTP helpers: timeouts, one retry, and a concurrency limiter. */

export type FetchFn = typeof fetch;

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

/** Limits simultaneous calls; extra calls wait in a bounded queue. */
export class Limiter {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(
    private readonly max: number,
    private readonly maxQueue = 100,
    private readonly maxWaitMs = 20_000,
  ) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.max) {
      if (this.queue.length >= this.maxQueue) throw new UpstreamError("Server busy, try again shortly", 503);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          const i = this.queue.indexOf(release);
          if (i >= 0) this.queue.splice(i, 1);
          reject(new UpstreamError("Server busy, try again shortly", 503));
        }, this.maxWaitMs);
        const release = () => {
          clearTimeout(timer);
          resolve();
        };
        this.queue.push(release);
      });
    }
    this.active++;
    try {
      return await task();
    } finally {
      this.active--;
      this.queue.shift()?.();
    }
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface FetchJsonOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  /** Retries after a network error, 429 or 5xx. */
  retries?: number;
}

export async function fetchJson(
  fetchFn: FetchFn,
  url: string,
  { timeoutMs = 10_000, headers = {}, retries = 1 }: FetchJsonOptions = {},
): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(500 * attempt);
    try {
      const res = await fetchFn(url, {
        headers: { accept: "application/json", ...headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status === 429 || res.status >= 500) {
        lastError = new UpstreamError(`Upstream returned ${res.status}`, res.status);
        continue;
      }
      if (!res.ok) throw new UpstreamError(`Upstream returned ${res.status}`, res.status);
      return await res.json();
    } catch (err) {
      if (err instanceof UpstreamError && err.status !== undefined && err.status < 500 && err.status !== 429) {
        throw err;
      }
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new UpstreamError("Upstream request failed");
}
