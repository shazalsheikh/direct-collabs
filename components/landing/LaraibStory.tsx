import { Section, Eyebrow, HonestLine } from "@/components/ui";
import { LARAIB, CPF_CURVE, visibleMedia, visibleStats } from "@/lib/proof.config";
import { num } from "@/lib/format";
import { MediaGrid } from "./Lightbox";

export function LaraibStory() {
  const payments = visibleMedia(LARAIB.payments);
  const chats = visibleMedia(LARAIB.chats);
  const ads = visibleMedia(LARAIB.adsManager);
  const stats = visibleStats();
  const forms = stats.find((s) => s.id === "forms");
  const deals = stats.find((s) => s.id === "deals");

  return (
    <Section wide>
      <Eyebrow>The first run</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">
        {LARAIB.followers} followers. Zero paid collabs. <span className="text-lime">Phir ek ad.</span>
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 text-bone-2">
          <p>
            {LARAIB.name} had {LARAIB.followers} followers and had never been paid for a collab.
          </p>
          <p>
            I ran one ad from her own page with an Instagram lead form, so brand owners could apply to her. Category,
            budget, handle.
          </p>
          {forms && deals && (
            <p>
              The form filled {forms.verified ? "" : "about "}
              <span className="tnum font-semibold text-bone">{num(forms.value as number)}</span> times. She closed{" "}
              {deals.verified ? "" : "about "}
              <span className="tnum font-semibold text-bone">{num(deals.value as number)}</span> paid deals.
            </p>
          )}
          {CPF_CURVE.weekOne && CPF_CURVE.weekThree && (
            <p>
              After three weeks the cost per form rose from {CPF_CURVE.verified ? "" : "about "}Rs {CPF_CURVE.weekOne}{" "}
              to Rs {CPF_CURVE.weekThree}. That is normal. Chapter 6 is how you refresh the creative before it
              happens.
            </p>
          )}
          <HonestLine />
        </div>

        <div className="space-y-6">
          <MediaGrid items={payments} label="Payments" />
          <MediaGrid items={chats} label="Brand chats" />
          <MediaGrid items={ads} label="Ads Manager and Lead Center" />
          {process.env.NODE_ENV !== "production" && payments.length + chats.length + ads.length === 0 && (
            <div className="rounded-card border border-dashed border-ink-4 p-5 text-sm text-bone-3">
              Dev only: screenshot slots are empty. Fill lib/proof.config.ts once {LARAIB.name} signs off. Hidden in production.
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
