import type { NetworkResponse } from "../../../shared/api.ts";
import {
  BLOCK_TIME_SECONDS,
  COLLATERAL,
  TIERS,
  TIER_LABEL,
  dailyFluxPerNode,
  fluxAprPct,
} from "../../../shared/rewards.ts";
import { fmtDuration, fmtFlux, fmtInt, fmtPct } from "../format.ts";
import { Section, TierSwatch } from "./ui.tsx";

export function NetworkTable({ network }: { network: NetworkResponse }) {
  return (
    <Section title="Tiers today" aside={`Live from the Flux network`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-normal">Tier</th>
              <th className="py-2 pr-4 text-right font-normal">Collateral</th>
              <th className="py-2 pr-4 text-right font-normal">Enabled nodes</th>
              <th className="py-2 pr-4 text-right font-normal">FLUX per block</th>
              <th className="py-2 pr-4 text-right font-normal">Per node per day</th>
              <th className="py-2 pr-4 text-right font-normal">Paid about every</th>
              <th className="py-2 text-right font-normal">Yearly reward rate</th>
            </tr>
          </thead>
          <tbody className="num">
            {TIERS.slice()
              .reverse()
              .map((t) => (
                <tr key={t} className="border-b border-line/60">
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2 font-medium">
                      <TierSwatch tier={t} />
                      {TIER_LABEL[t]}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right">{fmtInt(COLLATERAL[t])} FLUX</td>
                  <td className="py-2.5 pr-4 text-right">{fmtInt(network.nodes[t])}</td>
                  <td className="py-2.5 pr-4 text-right">{fmtFlux(network.rewardPerBlock[t])}</td>
                  <td className="py-2.5 pr-4 text-right">
                    {fmtFlux(dailyFluxPerNode(t, network.height, network.nodes[t]))} FLUX
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    {fmtDuration(network.nodes[t] * BLOCK_TIME_SECONDS * 1000)}
                  </td>
                  <td className="py-2.5 text-right">{fmtPct(fluxAprPct(t, network.height, network.nodes[t]))}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        Yearly reward rate is FLUX earned over the next 12 months as a share of collateral, including the next reduction.
      </p>
    </Section>
  );
}
