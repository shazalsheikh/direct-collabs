import type { Metadata } from "next";
import { LegalPage, H, UL, Contact } from "@/components/legal/LegalPage";
import { GUARANTEE, PAY_IN_2 } from "@/lib/offer.config";
import { rs } from "@/lib/format";

export const metadata: Metadata = { title: "Refund policy", description: "How refunds work at DirectCollabs.", alternates: { canonical: "/refund-policy" } };

/** Reads GUARANTEE.type from lib/offer.config.ts, so this page always matches the landing page. */
export default function RefundPolicy() {
  const perf = GUARANTEE.type === "performance";
  const g = GUARANTEE[GUARANTEE.type];
  const p = GUARANTEE.performance;
  return (
    <LegalPage title="Refund policy" intro={g.headline}>
      <p>{g.body}</p>

      <H>{perf ? "What has to be true" : "How the window works"}</H>
      <UL>
        {g.conditions.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </UL>

      {perf && (
        <>
          <H>What counts as a brand form</H>
          <p>
            A completed submission of the lead form from the course, shown in your Instagram Lead Center, from a person or business that is not you, your
            family or your team. We may ask for a screenshot of the Lead Center and of Ads Manager covering the {p.days} days.
          </p>
        </>
      )}

      <H>How to ask</H>
      <p>
        Send your order reference (it looks like DC-AB12){perf ? ", the Ads Manager screenshot and the Lead Center screenshot" : ""} on WhatsApp, email or Instagram. We check it
        and reply. If it qualifies we refund within {p.refundHours} hours of confirming, to the account you paid from.
      </p>
      <Contact />

      <H>Coaching and instalments</H>
      <UL>
        <li>This policy covers the course. The 1-on-1 coaching has its own terms, shown at checkout and confirmed in writing on WhatsApp when we book your first call.</li>
        {PAY_IN_2.enabled && (
          <li>
            If you paid in two parts, a refund covers what you have actually paid. If the second part ({rs(PAY_IN_2.second)}) is not paid, you owe nothing further and your
            access may be paused.
          </li>
        )}
        <li>A refund ends your access to the course and downloads.</li>
      </UL>

      <H>What this is not</H>
      <p>
        This is not a promise of income, brand deals or follower growth. Results depend on your followers, your rate and how fast you reply. Ad spend is paid to Meta,
        not to us, and is not refundable by us.
      </p>
    </LegalPage>
  );
}
