import { Section, Eyebrow, HonestLine } from "@/components/ui";
import { RESULTS } from "@/lib/proof.config";
import { rs, lakh } from "@/lib/format";

/** Two anonymous creators. Numbers come from lib/proof.config.ts and stay "about" until verified. */
export function Results() {
  if (RESULTS.length === 0) return null;
  const money = (n: number) => (n >= 100000 ? lakh(n) : rs(n));
  return (
    <Section wide>
      <Eyebrow>Results</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">
        Two creators we work with. <span className="text-lime">One system.</span>
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {RESULTS.map((r) => (
          <div key={r.id} className="rounded-card border border-ink-4 bg-ink-2 p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">Creator with {r.followers} followers</p>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[13px] text-bone-2">Put in</dt>
                <dd className="display tnum mt-1 whitespace-nowrap text-2xl sm:text-3xl">
                  {!r.verified && <span className="text-bone-3">~</span>}
                  {money(r.putIn)}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-bone-2">Brand deals closed</dt>
                <dd className="display tnum mt-1 whitespace-nowrap text-2xl text-lime sm:text-3xl">
                  {!r.verified && <span className="text-bone-3">~</span>}
                  {money(r.deals)}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-[15px] text-bone-2">Brand owners came to this creator and dealt with them directly. No agency took a cut.</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[13px] text-bone-3">Rounded numbers. Creator and brand names are kept private.</p>
      <HonestLine className="mt-2" />
    </Section>
  );
}
