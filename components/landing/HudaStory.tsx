import { Section, Eyebrow, HonestLine } from "@/components/ui";
import { HUDA, visibleMedia } from "@/lib/proof.config";
import { AD_BUDGET } from "@/lib/offer.config";
import { rs, num } from "@/lib/format";
import { MediaGrid } from "./Lightbox";

/**
 * Latest run. Small spend, one closed deal. Every number is read from HUDA in lib/proof.config.ts.
 * Until HUDA.consented is true the creator stays anonymous and no screenshots show.
 */
export function HudaStory() {
  const who = HUDA.consented ? HUDA.name : "A creator";
  const whose = HUDA.consented ? `${HUDA.name}'s` : "the creator's";
  const perDay = Math.round(HUDA.spend / HUDA.days);
  const perLead = Math.round(HUDA.spend / HUDA.leads);
  const show = HUDA.consented;
  const payments = show ? visibleMedia(HUDA.payments) : [];
  const chats = show ? visibleMedia(HUDA.chats) : [];
  const ads = show ? visibleMedia(HUDA.adsManager) : [];

  const tiles: { label: string; value: string; hot?: boolean }[] = [
    { label: "followers", value: HUDA.followers },
    { label: `ad spend, ${HUDA.days} days`, value: rs(HUDA.spend) },
    { label: "brand leads", value: num(HUDA.leads) },
    { label: `one deal, ${HUDA.dealWhat}`, value: rs(HUDA.dealValue), hot: true },
  ];

  return (
    <Section wide>
      <Eyebrow>Latest run</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">
        {HUDA.followers} followers. {rs(HUDA.spend)} in ads. <span className="text-lime">One {rs(HUDA.dealValue)} deal.</span>
      </h2>

      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className={`rounded-card border p-4 sm:p-5 ${t.hot ? "border-lime bg-ink-2" : "border-ink-4 bg-ink-2"}`}>
            <dd className={`display tnum text-3xl sm:text-4xl ${t.hot ? "text-lime" : ""}`}>{t.value}</dd>
            <dt className="mt-1 text-[13px] text-bone-2">{t.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 text-bone-2">
          <p>
            {who} with {HUDA.followers} followers ran one ad from {whose} own page, using the same Instagram lead form the course teaches. Brand owners applied with category,
            budget and handle.
          </p>
          <p>
            It ran for {HUDA.days} days at about {rs(perDay)} a day. That brought{" "}
            <span className="tnum font-semibold text-bone">{num(HUDA.leads)}</span> brand leads, about{" "}
            <span className="tnum font-semibold text-bone">{rs(perLead)}</span> a lead. One brand closed: {rs(HUDA.dealValue)} for {HUDA.dealWhat}.
          </p>
          <p>
            That is one deal so far, not a promise. A bigger or smaller page, and a different rate, will give a different result. At {rs(AD_BUDGET.minPerDay)} a day, expect roughly{" "}
            {Math.round(AD_BUDGET.minPerDay / perLead)} leads a day at this cost.
          </p>
          <HonestLine />
        </div>

        <div className="space-y-6">
          <MediaGrid items={payments} label="Payment" />
          <MediaGrid items={chats} label="Brand chat" />
          <MediaGrid items={ads} label="Ads Manager and Lead Center" />
          {process.env.NODE_ENV !== "production" && payments.length + chats.length + ads.length === 0 && (
            <div className="rounded-card border border-dashed border-ink-4 p-5 text-sm text-bone-3">
              Dev only: screenshot slots are empty and the creator is anonymous. Fill HUDA in lib/proof.config.ts and set consented to true once she signs off. Hidden in production.
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
