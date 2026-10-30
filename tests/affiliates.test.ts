import { afterEach, describe, expect, it } from "vitest";
import { AFFILIATES, affiliatesActive, amazonSearch } from "../web/src/affiliates.ts";

describe("affiliate links", () => {
  afterEach(() => {
    AFFILIATES.amazonTag = "";
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
});
