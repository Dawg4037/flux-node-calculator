import { afterAll, describe, expect, it } from "vitest";
import { fmtMonths, fmtRelative, setFormatLanguage } from "../web/src/format.ts";
import { de } from "../web/src/i18n/de.tsx";
import { en } from "../web/src/i18n/en.tsx";
import { es } from "../web/src/i18n/es.tsx";
import { fr } from "../web/src/i18n/fr.tsx";
import { pl } from "../web/src/i18n/pl.tsx";
import { pt } from "../web/src/i18n/pt.tsx";
import { ru } from "../web/src/i18n/ru.tsx";

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
      ["fr-FR", fr, "1 an et 2 mois", "dans 2 h 5 min"],
      ["pl-PL", pl, "1 rok i 2 miesiące", "za 2 h 5 min"],
      ["ru-RU", ru, "1 год и 2 месяца", "через 2 ч 5 мин"],
    ] as const;
    for (const [locale, t, months, rel] of cases) {
      setFormatLanguage(locale, t.fmt);
      expect(fmtMonths(14)).toBe(months);
      expect(fmtRelative(later, now)).toBe(rel);
    }
  });

  it("uses Polish and Russian plural forms", () => {
    setFormatLanguage("pl-PL", pl.fmt);
    expect([5, 12, 22, 25].map((m) => fmtMonths(m * 12))).toEqual(["5 lat", "12 lat", "22 lata", "25 lat"]);
    setFormatLanguage("ru-RU", ru.fmt);
    expect([1, 3, 5, 11, 21].map((m) => fmtMonths(m))).toEqual([
      "1 месяц",
      "3 месяца",
      "5 месяцев",
      "11 месяцев",
      "1 год и 9 месяцев",
    ]);
  });
});
