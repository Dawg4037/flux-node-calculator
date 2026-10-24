// Bundles the backend into a single file (dist/server.js).
// Runtime dependencies (fastify and plugins) stay external and load from node_modules.
import { build } from "esbuild";

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
});
