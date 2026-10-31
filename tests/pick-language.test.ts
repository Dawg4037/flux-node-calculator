import { describe, expect, it } from "vitest";
import { pickLanguage } from "../server/app.ts";

const pages = new Set(["pt", "de", "es", "fr", "pl", "ru", "id"]);

describe("pickLanguage", () => {
  it("falls back to English", () => {
    expect(pickLanguage(undefined, pages)).toBeNull();
    expect(pickLanguage("", pages)).toBeNull();
    expect(pickLanguage("ja-JP,zh;q=0.8", pages)).toBeNull();
  });
  it("uses the first supported language", () => {
    expect(pickLanguage("de-AT,de;q=0.9,en;q=0.8", pages)).toBe("de");
    expect(pickLanguage("ja,pt-BR;q=0.7", pages)).toBe("pt");
  });
  it("stops at English when it ranks higher", () => {
    expect(pickLanguage("en-GB,pt;q=0.8", pages)).toBeNull();
  });
  it("respects q values and ignores q=0", () => {
    expect(pickLanguage("fr;q=0.2,ru", pages)).toBe("ru");
    expect(pickLanguage("ru;q=0,es", pages)).toBe("es");
  });
});
