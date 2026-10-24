import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "web",
  plugins: [react(), tailwindcss()],
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
