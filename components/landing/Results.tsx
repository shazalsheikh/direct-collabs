import Image from "next/image";
import { Section, Eyebrow, HonestLine } from "@/components/ui";
import { RESULTS } from "@/lib/proof.config";
import { rs, lakh } from "@/lib/format";

/** Real brand requests from the lead form, cropped to the question answers. Contact details are removed, not blurred. */
const LEADS = [
  { src: "/proof/lead-11-nov.jpg", w: 532, h: 392, alt: "Brand request, 11 November 2026: jewellery and accessories, budget 100k+, not running Meta ads" },
  { src: "/proof/lead-12-nov.jpg", w: 510, h: 392, alt: "Brand request, 12 November 2026: clothing, budget 20k to 40k, not running Meta ads" },
  { src: "/proof/lead-13-nov.jpg", w: 536, h: 362, alt: "Brand request, 13 November 2026: makeup and skincare, budget 20k to 40k, running Meta ads" },
];

/** Two anonymous creators. Numbers come from lib/proof.config.ts and stay "about" until verified. */
export function Results() {
  if (RESULTS.length === 0) return null;
  const money = (n: number) => (n >= 100000 ? lakh(n) : rs(n));
  return (
    <Section wide>
      <Eyebrow lime>Case studies</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">
        Two creators we work with. <span className="text-lime">One system.</span>
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {RESULTS.map((r) => (
          <div key={r.id} className="rounded-card border border-lime/50 bg-ink-2 p-6 shadow-[0_0_0_1px_rgba(200,255,80,0.08),0_20px_60px_-30px_rgba(200,255,80,0.25)] sm:p-8">
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
      {/* Daily consistency: brand requests on three days in a row. */}
      <div className="mt-12">
        <p className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">Brand requests, three days in a row</p>
        <p className="mt-2 text-[15px] text-bone-2">Brand owners fill in the form, and the request lands with us. Contact details removed.</p>
        <ul className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
          {LEADS.map((l) => (
            <li key={l.src} className="w-[78%] shrink-0 snap-start overflow-hidden rounded-card border border-ink-4 bg-white sm:w-[340px]">
              <Image src={l.src} alt={l.alt} width={l.w} height={l.h} sizes="(min-width: 640px) 340px, 78vw" className="h-auto w-full" />
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-[13px] text-bone-3">Rounded numbers. Creator and brand names are kept private.</p>
      <HonestLine className="mt-2" />
    </Section>
  );
}
