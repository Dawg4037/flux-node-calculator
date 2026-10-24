import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

export default defineConfig({
  root: "web",
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    // During development, forward API calls to the local backend.
    proxy: { "/api": "http://127.0.0.1:8080" },
  },
});
