import { Section, Eyebrow } from "@/components/ui";
import { ANCHOR, PLANS } from "@/lib/offer.config";
import { rs } from "@/lib/format";

const ROWS: [string, string, string][] = [
  ["Who finds the brand", "The agency, when they feel like it", "Your ad. Brands apply to you"],
  ["Who sets your rate", "Agency, and they quote low to close fast", "You. Chapter 5"],
  ["What you keep", `About ${100 - ANCHOR.agencyCutPct}% of your fee`, "100% of your fee. Ad spend is yours."],
  ["Who owns the relationship", "Agency. Brand never has your number", "You. Repeat deals in your DMs"],
  ["Cost", `About ${ANCHOR.agencyCutPct}% of every deal, forever`, `${rs(PLANS.pro.price)} once, plus your ad spend`],
];

export function Compare() {
  return (
    <Section tone="ink-2" wide>
      <Eyebrow>Agency vs DirectCollabs</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">Same brand. Different deal.</h2>

      {/* Phone: stacked cards */}
      <ul className="mt-8 space-y-3 sm:hidden">
        {ROWS.map(([k, a, b]) => (
          <li key={k} className="rounded-card border border-ink-4 bg-ink p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">{k}</p>
            <div className="mt-3 grid grid-cols-[72px_1fr] gap-x-3 gap-y-2 text-sm">
              <span className="text-bone-3">Agency</span>
              <span className="text-bone-3">{a}</span>
              <span className="font-semibold text-lime">Direct</span>
              <span className="text-bone">{b}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet and up: table */}
      <div className="mt-8 hidden overflow-hidden rounded-card border border-ink-4 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-[11px] uppercase tracking-[0.14em] text-bone-3">
            <tr>
              <th className="px-4 py-3 font-semibold sm:px-5">What</th>
              <th className="px-4 py-3 font-semibold sm:px-5">Agency</th>
              <th className="px-4 py-3 font-semibold text-lime sm:px-5">DirectCollabs</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([k, a, b]) => (
              <tr key={k} className="border-t border-ink-4 align-top">
                <th scope="row" className="px-4 py-4 font-semibold text-bone sm:px-5">
                  {k}
                </th>
                <td className="px-4 py-4 text-bone-3 sm:px-5">{a}</td>
                <td className="px-4 py-4 text-bone sm:px-5">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-bone-2">
        Agency keeps {rs(ANCHOR.agencyKeeps)} of a {rs(ANCHOR.dealValue)} deal.{" "}
        <span className="text-bone">The course costs less than two agency cuts.</span>
      </p>
    </Section>
  );
}
