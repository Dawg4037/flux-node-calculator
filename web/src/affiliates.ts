/**
 * Affiliate and referral links, in one place. Each program is off until its ID is filled in,
 * and then every link to that partner carries it. The page shows a disclosure whenever any is on.
 *
 * Rules: affiliate links never change a calculation or result, and they are plain links
 * (no scripts or trackers on this site).
 */

export const AFFILIATES = {
  /** Amazon Associates tracking ID, e.g. "fluxnodecalc-20". Empty = plain links. */
  amazonTag: "",
  amazonDomain: "www.amazon.com",
  /** InFlux / FluxCloud referral code, once their program launches. Empty = plain links. */
  fluxReferral: "",
};

export const affiliatesActive = () => AFFILIATES.amazonTag !== "" || AFFILIATES.fluxReferral !== "";

/** An Amazon search link (search results, so it never points at a sold-out or repriced item). */
export function amazonSearch(query: string): string {
  const u = new URL(`https://${AFFILIATES.amazonDomain}/s`);
  u.searchParams.set("k", query);
  if (AFFILIATES.amazonTag) u.searchParams.set("tag", AFFILIATES.amazonTag);
  return u.toString();
}

/**
 * Curated hardware picks for the Run a node tab, based on what operators in the Flux Discord
 * actually run (Oct 2026): used or renewed mini PCs, one machine with several nodes in Proxmox,
 * and spending on RAM, storage and a UPS rather than new high-end PCs.
 *
 * Each pick links to an Amazon search. To recommend one specific product instead, set `asin`
 * (the code after /dp/ in an Amazon product URL). Update PICKS_CHECKED when the list is reviewed.
 */
export const PICKS_CHECKED = "2026-10";

export type PickId = "cumulus" | "nimbus" | "stratus" | "multi" | "ram" | "nvme" | "ups" | "nic";

export interface HardwarePick {
  id: PickId;
  /** Amazon search used when no specific product is set. */
  search: string;
  /** Optional specific product (ASIN). */
  asin?: string;
}

export const HARDWARE_PICKS: HardwarePick[] = [
  { id: "cumulus", search: "renewed mini pc 16gb ram 512gb ssd" },
  { id: "nimbus", search: "ryzen 7 5825u mini pc 32gb ram" },
  { id: "stratus", search: "ryzen 9 mini pc 64gb ram 1tb" },
  { id: "multi", search: "renewed workstation 128gb ram" },
  { id: "ram", search: "32gb ddr4 sodimm kit" },
  { id: "nvme", search: "1tb nvme ssd pcie" },
  { id: "ups", search: "ups battery backup 600va" },
  { id: "nic", search: "intel i226 2.5gbe pcie network card" },
];

/** Link for a pick: the specific product when set, otherwise the search. */
export function pickUrl(pick: HardwarePick): string {
  if (pick.asin) {
    const u = new URL(`https://${AFFILIATES.amazonDomain}/dp/${encodeURIComponent(pick.asin)}`);
    if (AFFILIATES.amazonTag) u.searchParams.set("tag", AFFILIATES.amazonTag);
    return u.toString();
  }
  return amazonSearch(pick.search);
}
