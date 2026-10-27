// Bundles the backend into a single file (dist/server.js).
// Runtime dependencies (fastify and plugins) stay external and load from node_modules.
import { readFileSync } from "node:fs";
import { build } from "esbuild";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));

await build({
  entryPoints: ["server/index.ts"],
  outfile: "dist/server.js",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  packages: "external",
  sourcemap: false,
  logLevel: "info",
  // Shown by /api/health so each instance can report which release it runs.
  define: { "process.env.APP_VERSION": JSON.stringify(version) },
});
