import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui";
import { GUARANTEE } from "@/lib/offer.config";

export function Guarantee() {
  const g = GUARANTEE[GUARANTEE.type];
  return (
    <Section tone="ink-2" wide>
      <div className="rounded-card border border-ink-4 bg-ink p-6 sm:p-10">
        <Eyebrow lime>Guarantee</Eyebrow>
        <h2 className="display mt-3 text-3xl sm:text-5xl">{g.headline}</h2>
        <p className="mt-4 max-w-xl text-bone-2">{g.body}</p>
        <Link href="/refund-policy" className="mt-4 inline-flex min-h-11 items-center text-sm text-bone-3 underline underline-offset-4 hover:text-bone">
          Full refund policy
        </Link>
      </div>
    </Section>
  );
}
