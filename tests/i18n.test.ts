import { afterAll, describe, expect, it } from "vitest";
import { fmtMonths, fmtRelative, setFormatLanguage } from "../web/src/format.ts";
import { de } from "../web/src/i18n/de.tsx";
import { en } from "../web/src/i18n/en.tsx";
import { es } from "../web/src/i18n/es.tsx";
import { pt } from "../web/src/i18n/pt.tsx";

describe("language-aware formatting", () => {
  afterAll(() => setFormatLanguage("en-US", en.fmt));

  it("writes durations in each language", () => {
    const now = Date.parse("2026-01-01T00:00:00Z");
    const later = new Date(now + (2 * 3600 + 5 * 60) * 1000).toISOString();
    const cases = [
      ["en-US", en, "1 year 2 months", "in 2h 5m"],
      ["pt-BR", pt, "1 ano e 2 meses", "em 2h 5min"],
      ["es-ES", es, "1 año y 2 meses", "en 2h 5min"],
      ["de-DE", de, "1 Jahr und 2 Monaten", "in 2 Std. 5 Min."],
    ] as const;
    for (const [locale, t, months, rel] of cases) {
      setFormatLanguage(locale, t.fmt);
      expect(fmtMonths(14)).toBe(months);
      expect(fmtRelative(later, now)).toBe(rel);
    }
  });
});
