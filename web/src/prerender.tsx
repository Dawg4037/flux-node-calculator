// Build-time only: renders the page shell (header, tabs, placeholders) to HTML for each
// language, so text shows before the JavaScript loads. See scripts/prerender.mjs.
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.tsx";
import { LANGS, LangProvider, type Lang } from "./i18n/index.tsx";

export { LANGS };

export const render = (lang: Lang) =>
  renderToString(
    <StrictMode>
      <LangProvider initial={lang}>
        <App />
      </LangProvider>
    </StrictMode>,
  );
