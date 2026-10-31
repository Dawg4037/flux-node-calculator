import type { NetworkResponse } from "../../../shared/api.ts";
import {
  BLOCK_TIME_SECONDS,
  COLLATERAL,
  TIERS,
  TIER_LABEL,
  dailyFluxPerNode,
  fluxAprPct,
  parallelAssetMultiplier,
  totalAprPct,
} from "../../../shared/rewards.ts";
import { fmtDuration, fmtFlux, fmtInt, fmtPct } from "../format.ts";
import { useT } from "../i18n/index.tsx";
import { paActiveNow, parallelAssetsFor } from "../model.ts";
import type { AppState } from "../state.ts";
import { HowItWorksButton } from "./HowItWorks.tsx";
import { Section, TierSwatch } from "./ui.tsx";

export function NetworkTable({ network, state }: { network: NetworkResponse | null; state: AppState }) {
  const t = useT().network;
  const paMult = paActiveNow(state) ? parallelAssetMultiplier({ count: state.paCount, valuePct: 100, endHeight: 0 }) : 0;
  const pa = paMult > 0 && network ? parallelAssetsFor(state, { network, price: 0 }) : undefined;
  return (
    <Section
      title={t.title}
      aside={
        <>
          {t.live} <HowItWorksButton className="text-ink" />
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-normal">{t.tier}</th>
              <th className="py-2 pr-4 text-right font-normal">{t.collateral}</th>
              <th className="py-2 pr-4 text-right font-normal">{t.enabled}</th>
              <th className="py-2 pr-4 text-right font-normal">{t.perBlock}</th>
              <th className="py-2 pr-4 text-right font-normal">{t.perDay}</th>
              {paMult > 0 && <th className="py-2 pr-4 text-right font-normal">{t.withPa}</th>}
              <th className="py-2 pr-4 text-right font-normal">{t.paidEvery}</th>
              <th className="py-2 text-right font-normal">{t.rate}</th>
            </tr>
          </thead>
          <tbody className="num">
            {TIERS.slice()
              .reverse()
              .map((tier) => network ? (
                <tr key={tier} className="border-b border-line/60">
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2 font-medium">
                      <TierSwatch tier={tier} />
                      {TIER_LABEL[tier]}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right">{fmtInt(COLLATERAL[tier])} FLUX</td>
                  <td className="py-2.5 pr-4 text-right">{fmtInt(network.nodes[tier])}</td>
                  <td className="py-2.5 pr-4 text-right">{fmtFlux(network.rewardPerBlock[tier])}</td>
                  <td className="py-2.5 pr-4 text-right">
                    {fmtFlux(dailyFluxPerNode(tier, network.height, network.nodes[tier]))} FLUX
                  </td>
                  {paMult > 0 && (
                    <td className="py-2.5 pr-4 text-right">
                      {fmtFlux(dailyFluxPerNode(tier, network.height, network.nodes[tier]) * (1 + paMult))} FLUX
                    </td>
                  )}
                  <td className="py-2.5 pr-4 text-right">
                    {fmtDuration(network.nodes[tier] * BLOCK_TIME_SECONDS * 1000)}
                  </td>
                  <td className="py-2.5 text-right">
                    {pa ? (
                      <>
                        {fmtPct(totalAprPct(tier, network.height, network.nodes[tier], pa))}
                        <span className="block text-xs text-muted">
                          {t.native(fmtPct(fluxAprPct(tier, network.height, network.nodes[tier])))}
                        </span>
                      </>
                    ) : (
                      fmtPct(fluxAprPct(tier, network.height, network.nodes[tier]))
                    )}
                  </td>
                </tr>
              ) : (
                // Placeholder row with the same height, so the page doesn't shift when data arrives.
                <tr key={tier} className="border-b border-line/60">
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2 font-medium">
                      <TierSwatch tier={tier} />
                      {TIER_LABEL[tier]}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right">{fmtInt(COLLATERAL[tier])} FLUX</td>
                  {Array.from({ length: paMult > 0 ? 6 : 5 }, (_, i) => (
                    <td key={i} className={`py-2.5 text-right text-muted ${i < (paMult > 0 ? 5 : 4) ? "pr-4" : ""}`}>
                      —
                      {paMult > 0 && i === 5 && <span className="invisible block text-xs">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        {t.footnote(paMult > 0 ? state.paCount : null)}
      </p>
    </Section>
  );
}
