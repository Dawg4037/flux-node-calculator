import type { ReactNode } from "react";
import { COLLATERAL, TIERS, TIER_LABEL } from "../../../shared/rewards.ts";
import { AFFILIATES, HARDWARE_SEARCHES, affiliatesActive, amazonSearch } from "../affiliates.ts";
import { currentLocale, fmtInt } from "../format.ts";
import { useLang } from "../i18n/index.tsx";
import { GUIDE_CHECKED, LINKS, TIER_HARDWARE } from "../nodeGuide.ts";
import type { AppState } from "../state.ts";
import { Section, TierSwatch } from "./ui.tsx";

/** Outbound link. Affiliate links are marked "sponsored" as search engines ask. */
function Ext({ href, children, sponsored = false }: { href: string; children: ReactNode; sponsored?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel={`noopener noreferrer${sponsored ? " sponsored" : ""}`}
      className="underline decoration-line underline-offset-2 hover:decoration-ink"
    >
      {children}
    </a>
  );
}

function Card({ title, tag, children }: { title: string; tag?: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-line p-4">
      <p className="text-lg font-semibold">{title}</p>
      {tag && <p className="text-sm text-muted">{tag}</p>}
      <div className="mt-2 space-y-2 text-sm">{children}</div>
    </div>
  );
}

export function RunNodeTab({ update }: { update: (p: Partial<AppState>) => void }) {
  const t = useLang().t.run;
  const checked = new Date(`${GUIDE_CHECKED}-01T00:00:00Z`).toLocaleDateString(currentLocale(), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const tiers = TIERS.slice().reverse();
  const amazon = AFFILIATES.amazonTag !== "";

  const rows: Array<[string, (tier: (typeof tiers)[number]) => string]> = [
    [t.collateral, (tier) => `${fmtInt(COLLATERAL[tier])} FLUX`],
    [t.cpu, (tier) => t.coresThreads(TIER_HARDWARE[tier].cores, TIER_HARDWARE[tier].threads)],
    [t.ram, (tier) => `${TIER_HARDWARE[tier].ramGb} GB`],
    [t.ssd, (tier) => `${fmtInt(TIER_HARDWARE[tier].ssdGb)} GB`],
    [t.eps, (tier) => fmtInt(TIER_HARDWARE[tier].eps)],
    [t.disk, (tier) => `${TIER_HARDWARE[tier].diskMBs} MB/s`],
    [t.bandwidth, (tier) => `${TIER_HARDWARE[tier].mbps} Mbit/s`],
  ];

  return (
    <div className="space-y-10">
      <p className="max-w-prose text-muted">{t.intro(checked)}</p>

      <Section title={t.needTitle} aside={<Ext href={LINKS.whatAreNodes}>{t.officialSpecs}</Ext>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-line text-right">
                <th className="py-2 pr-4" />
                {tiers.map((tier) => (
                  <th key={tier} className="py-2 pr-4 font-medium last:pr-0">
                    <span className="inline-flex items-center gap-2">
                      <TierSwatch tier={tier} />
                      {TIER_LABEL[tier]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="num text-right">
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-line/60">
                  <th scope="row" className="py-2 pr-4 text-left font-normal text-muted">
                    {label}
                  </th>
                  {tiers.map((tier) => (
                    <td key={tier} className="py-2 pr-4 last:pr-0">
                      {value(tier)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">{t.needNote}</p>
      </Section>

      <Section title={t.homeTitle}>
        <ul className="max-w-prose list-disc space-y-2 pl-5 text-sm">
          <li>{t.homeArcane}</li>
          <li>{t.homeHardware}</li>
          <li>{t.homeNetwork}</li>
          <li>{t.dataCenter}</li>
        </ul>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Ext href={LINKS.arcaneOs}>{t.arcaneGuide}</Ext>
          <Ext href={LINKS.legacy}>{t.legacyGuide}</Ext>
        </p>
      </Section>

      <Section title={t.walletTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="SSP Wallet" tag={t.sspTag}>
            <p>{t.sspText}</p>
            <p>
              <Ext href={LINKS.sspWallet}>sspwallet.io</Ext>
            </p>
          </Card>
          <Card title="Zelcore" tag={t.zelcoreTag}>
            <p>{t.zelcoreText}</p>
            <p>
              <Ext href={LINKS.zelcore}>zelcore.io</Ext>
            </p>
          </Card>
        </div>
      </Section>

      <Section title={t.stepsTitle}>
        <ol className="max-w-prose list-decimal space-y-3 pl-5 text-sm">
          <li>
            {t.step1} <Ext href={LINKS.buyFlux}>{t.step1Link}</Ext>
          </li>
          <li>{t.step2}</li>
          <li>
            {t.step3}{" "}
            <span className="whitespace-nowrap">
              <Ext href={LINKS.arcaneOsSteps}>ArcaneOS</Ext> · <Ext href={LINKS.legacy}>Legacy</Ext>
            </span>
          </li>
          <li>
            {t.step4}{" "}
            <span className="whitespace-nowrap">
              <Ext href={LINKS.startSsp}>{t.startSsp}</Ext> · <Ext href={LINKS.startZelcore}>{t.startZelcore}</Ext>
            </span>
          </li>
          <li>
            {t.step5}{" "}
            <button type="button" className="underline" onClick={() => update({ tab: "lookup" })}>
              {t.openLookup}
            </button>
          </li>
        </ol>
      </Section>

      <Section title={t.hwTitle}>
        <p className="max-w-prose text-sm text-muted">{t.hwIntro}</p>
        <ul className="mt-3 space-y-2 text-sm">
          {tiers.map((tier) => (
            <li key={tier} className="flex items-center gap-2">
              <TierSwatch tier={tier} />
              <Ext href={amazonSearch(HARDWARE_SEARCHES[tier])} sponsored={amazon}>
                {t.hwTier(TIER_LABEL[tier])}
              </Ext>
            </li>
          ))}
          <li>
            <Ext href={amazonSearch(HARDWARE_SEARCHES.nvme)} sponsored={amazon}>
              {t.hwNvme}
            </Ext>
          </li>
          <li>
            <Ext href={amazonSearch(HARDWARE_SEARCHES.ups)} sponsored={amazon}>
              {t.hwUps}
            </Ext>
          </li>
        </ul>
      </Section>

      <Section title={t.noHwTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-sm">
            <p>{t.titanText}</p>
            <p className="mt-1">
              <Ext href={LINKS.titan}>{t.titanLink}</Ext>
            </p>
          </div>
          <div className="text-sm">
            <p>{t.managedText}</p>
            <p className="mt-1">
              <Ext href={LINKS.managed}>{t.managedLink}</Ext>
            </p>
          </div>
        </div>
      </Section>

      <Section title={t.healthTitle}>
        <p className="max-w-prose text-sm">{t.healthText}</p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Ext href={LINKS.diagnosing}>{t.diagnosing}</Ext>
          <Ext href={LINKS.unlock}>{t.unlock}</Ext>
        </p>
      </Section>

      {affiliatesActive() && (
        <p className="border-t border-line pt-4 text-xs text-muted">
          {t.disclosure} {amazon && t.amazonNote}
        </p>
      )}
    </div>
  );
}
