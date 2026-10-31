// Runs after `vite build`. Writes the page shell into dist/public/index.html (English) and
// index.<lang>.html for each other language, then saves .br and .gz copies of the text files
// so the server can send them compressed without compressing anything at request time.
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";
import { build } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "dist/public");
const tmpDir = path.join(root, ".prerender");

await build({
  configFile: path.join(root, "vite.config.ts"),
  logLevel: "warn",
  build: { ssr: path.join(root, "web/src/prerender.tsx"), outDir: tmpDir, emptyOutDir: true },
});

try {
  const { render, LANGS } = await import(pathToFileURL(path.join(tmpDir, "prerender.js")).href);
  const template = readFileSync(path.join(outDir, "index.html"), "utf8");
  if (!template.includes('<div id="root"></div>')) throw new Error("index.html has no empty #root");
  for (const lang of LANGS) {
    const html = template
      .replace('<html lang="en">', `<html lang="${lang === "pt" ? "pt-BR" : lang}">`)
      .replace('<div id="root"></div>', `<div id="root">${render(lang)}</div>`);
    writeFileSync(path.join(outDir, lang === "en" ? "index.html" : `index.${lang}.html`), html);
  }
  console.log(`prerendered ${LANGS.length} languages`);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}

// ------------------------------------------------------------ precompress
const COMPRESSIBLE = /\.(html|js|css|svg|json|txt)$/;
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
let saved = 0;
for (const file of walk(outDir).filter((f) => COMPRESSIBLE.test(f))) {
  const raw = readFileSync(file);
  if (raw.length < 1024) continue;
  const br = brotliCompressSync(raw, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: raw.length },
  });
  writeFileSync(`${file}.br`, br);
  writeFileSync(`${file}.gz`, gzipSync(raw, { level: 9 }));
  saved += raw.length - br.length;
}
console.log(`precompressed (brotli saves ${Math.round(saved / 1024)} KB)`);
