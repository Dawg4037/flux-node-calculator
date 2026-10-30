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

/** Hardware searches for home nodes. All home nodes need AMD64, TPM 2.0 and UEFI (ArcaneOS). */
export const HARDWARE_SEARCHES = {
  cumulus: "mini pc 4 core 16gb ram 512gb nvme tpm 2.0",
  nimbus: "mini pc 8 core 32gb ram 1tb nvme tpm 2.0",
  stratus: "mini pc 16 thread 64gb ram 1tb nvme tpm 2.0",
  nvme: "1tb nvme ssd",
  ups: "ups battery backup 600va",
} as const;
