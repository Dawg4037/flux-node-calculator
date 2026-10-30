import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { AFFILIATES, HARDWARE_PICKS, affiliatesActive, amazonSearch, pickUrl } from "../web/src/affiliates.ts";

describe("affiliate links", () => {
  const realTag = AFFILIATES.amazonTag;
  beforeEach(() => {
    AFFILIATES.amazonTag = "";
  });
  afterAll(() => {
    AFFILIATES.amazonTag = realTag;
  });

  it("ship with the site's Amazon tag", () => {
    expect(realTag).toBe("dawg4037-20");
  });

  it("are plain links until a tag is set", () => {
    expect(affiliatesActive()).toBe(false);
    const url = new URL(amazonSearch("mini pc tpm 2.0"));
    expect(url.hostname).toBe("www.amazon.com");
    expect(url.searchParams.get("k")).toBe("mini pc tpm 2.0");
    expect(url.searchParams.has("tag")).toBe(false);
  });

  it("carry the Amazon tag once it is set", () => {
    AFFILIATES.amazonTag = "example-20";
    expect(affiliatesActive()).toBe(true);
    expect(new URL(amazonSearch("ups")).searchParams.get("tag")).toBe("example-20");
  });

  it("link a pick to a specific product when one is set, else to a search", () => {
    const pick = HARDWARE_PICKS[0]!;
    expect(pickUrl(pick)).toContain("/s?k=");
    AFFILIATES.amazonTag = "example-20";
    const url = new URL(pickUrl({ ...pick, asin: "B0TEST1234" }));
    expect(url.pathname).toBe("/dp/B0TEST1234");
    expect(url.searchParams.get("tag")).toBe("example-20");
  });
});
