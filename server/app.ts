/** Builds the Fastify app. Separate from index.ts so tests can inject mocks. */
import { existsSync } from "node:fs";
import path from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { FLUX_ADDRESS_RE } from "../shared/rewards.ts";
import type { Config } from "./config.ts";
import { FluxClient } from "./flux.ts";
import { PriceClient } from "./price.ts";
import { UpstreamError, type FetchFn } from "./upstream.ts";

export interface AppDeps {
  config: Config;
  fetchFn?: FetchFn;
  /** Start background refresh timers (off in tests). */
  background?: boolean;
  logger?: boolean;
}

/** Strip node-lookup addresses from logged URLs. */
const redactUrl = (url: string) => url.replace(/^\/api\/lookup\/[^?#]*/, "/api/lookup/:address");

export async function buildApp({ config, fetchFn = fetch, background = true, logger = true }: AppDeps) {
  const app: FastifyInstance = Fastify({
    trustProxy: config.trustProxy,
    bodyLimit: 1024,
    logger: logger
      ? {
          level: "info",
          serializers: {
            req: (req) => ({ method: req.method, url: redactUrl(req.url) }),
          },
        }
      : false,
  });

  const flux = new FluxClient(config.fluxApiBaseUrl, fetchFn, config.fluxMaxConcurrency, app.log);
  const price = new PriceClient(config.coingeckoBaseUrl, config.coingeckoApiKey, fetchFn, app.log);

  if (!config.coingeckoApiKey) app.log.warn("COINGECKO_API_KEY is not set; using CoinGecko's keyless endpoint");

  // ---------------------------------------------------------------- security
  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        // Cloudflare Web Analytics: beacon script and where it reports visits.
        scriptSrc: ["'self'", "https://static.cloudflareinsights.com"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", "https://cloudflareinsights.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // FluxCloud terminates TLS in front of the app; HSTS is still safe to send.
    hsts: { maxAge: 15_552_000, includeSubDomains: false },
  });
  app.addHook("onSend", async (_req, reply) => {
    reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  });

  // Rate limits apply to API routes only. The page's own files (HTML, CSS, JS, fonts, icons) are
  // never limited: if visitors share one IP behind a proxy, a refused stylesheet breaks the page.
  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: (_req, ctx) => ({
      statusCode: 429,
      error: `Too many requests. Try again in ${Math.ceil(ctx.ttl / 1000)} seconds.`,
    }),
  });
  const apiLimit = { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } };

  // --------------------------------------------------------------------- api
  app.get("/api/health", apiLimit, async (_req, reply) => {
    reply.header("cache-control", "no-store");
    return {
      ok: true,
      version: config.version,
      network: flux.getNetwork() !== null,
      price: price.getPrice() !== null,
      priceSource: price.status(),
    };
  });

  app.get("/api/network", apiLimit, async (_req, reply) => {
    const n = flux.getNetwork();
    if (!n) return reply.code(503).header("retry-after", "10").send({ error: "Network data is loading, try again shortly." });
    reply.header("cache-control", "public, max-age=30");
    return n;
  });

  app.get("/api/price", apiLimit, async (_req, reply) => {
    const p = price.getPrice();
    if (!p) return reply.code(503).header("retry-after", "30").send({ error: "Price data is loading, try again shortly." });
    reply.header("cache-control", "public, max-age=60");
    return p;
  });

  app.get<{ Params: { address: string } }>(
    "/api/lookup/:address",
    {
      config: { rateLimit: { max: config.lookupRatePerMinute, timeWindow: "1 minute" } },
      schema: {
        params: {
          type: "object",
          required: ["address"],
          properties: { address: { type: "string", minLength: 35, maxLength: 35 } },
        },
      },
    },
    async (req, reply) => {
      const { address } = req.params;
      if (!FLUX_ADDRESS_RE.test(address)) {
        return reply.code(400).send({ error: "That doesn't look like a Flux address (t1… or t3…, 35 characters)." });
      }
      try {
        const result = await flux.lookup(address);
        reply.header("cache-control", "private, max-age=60");
        return result;
      } catch (err) {
        if (err instanceof UpstreamError && err.status === 400) return reply.code(400).send({ error: err.message });
        if (err instanceof UpstreamError && err.status === 503) return reply.code(503).send({ error: err.message });
        req.log.warn({ err: (err as Error).message }, "lookup failed");
        return reply.code(502).send({ error: "The Flux network API didn't respond. Try again in a minute." });
      }
    },
  );

  // ------------------------------------------------------------ static site
  const staticRoot = path.resolve(config.staticDir);
  const hasStatic = existsSync(path.join(staticRoot, "index.html"));
  if (hasStatic) {
    await app.register(fastifyStatic, {
      root: staticRoot,
      index: ["index.html"],
      wildcard: false,
      setHeaders: (reply, filePath) => {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          reply.header("cache-control", "public, max-age=31536000, immutable");
        } else {
          reply.header("cache-control", "no-cache");
        }
      },
    });
  }

  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith("/api/") || req.method !== "GET" || !hasStatic) {
      return reply.code(404).send({ error: "Not found" });
    }
    return reply.header("cache-control", "no-cache").sendFile("index.html");
  });

  app.setErrorHandler((err: { statusCode?: number; validation?: unknown; message?: string }, req, reply) => {
    if (err.validation) return reply.code(400).send({ error: "Invalid request." });
    const status = err.statusCode && err.statusCode >= 400 && err.statusCode < 500 ? err.statusCode : 500;
    if (status === 500) req.log.error({ err: err.message }, "unhandled error");
    return reply.code(status).send({ error: status === 500 ? "Something went wrong." : (err.message ?? "Bad request") });
  });

  // ------------------------------------------------------- background tasks
  const timers: NodeJS.Timeout[] = [];
  let priceTimer: NodeJS.Timeout | undefined;
  let closing = false;
  if (background) {
    void flux.refreshNetwork();
    timers.push(setInterval(() => void flux.refreshNetwork(), config.networkRefreshMs));
    for (const t of timers) t.unref();
    // Price: normal interval after a success, quick retries after a failure (see PriceClient).
    const priceLoop = async () => {
      await price.refresh();
      if (closing) return;
      priceTimer = setTimeout(() => void priceLoop(), price.nextDelayMs(config.priceRefreshMs));
      priceTimer.unref();
    };
    void priceLoop();
  }
  app.addHook("onClose", async () => {
    closing = true;
    timers.forEach(clearInterval);
    clearTimeout(priceTimer);
  });

  return { app, flux, price };
}
