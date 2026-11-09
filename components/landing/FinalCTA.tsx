import Link from "next/link";
import { Section, LinkButton, HonestLine, Container } from "@/components/ui";
import { PLANS, AD_BUDGET } from "@/lib/offer.config";
import { SITE, whatsappLink } from "@/lib/site.config";
import { rs } from "@/lib/format";

export function FinalCTA() {
  return (
    <Section wide>
      <h2 className="display text-4xl sm:text-6xl">
        Brands ko apply krne do. <span className="text-lime">Aaj raat se.</span>
      </h2>
      <p className="mt-4 max-w-md text-bone-2">
        One ad, one form, {rs(AD_BUDGET.minPerDay)} a day. The whole setup in {SITE.course.durationLabel}, in{" "}
        {SITE.course.language}.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:max-w-sm">
        <LinkButton href="/checkout?plan=pro" className="w-full">
          Get the system · {rs(PLANS.pro.price)}
        </LinkButton>
        <Link
          href="#plans"
          className="min-h-11 inline-flex items-center justify-center text-sm text-bone-3 underline-offset-4 hover:text-bone hover:underline"
        >
          or work with me 1-on-1
        </Link>
      </div>
      <HonestLine className="mt-4 max-w-md" />
    </Section>
  );
}

export function Footer() {
  const wa = whatsappLink("Hi, I have a question about DirectCollabs.");
  return (
    <footer className="border-t border-ink-4 pt-10 pb-28 text-sm text-bone-3 md:pb-10">
      <Container wide>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="display text-lg text-bone">
              Direct<span className="text-lime">Collabs</span>
            </p>
            <p className="mt-1">{SITE.legal.city}</p>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            {wa && (
              <a href={wa} className="min-h-9 inline-flex items-center hover:text-bone">
                WhatsApp
              </a>
            )}
            <a href={SITE.owner.instagramUrl} target="_blank" rel="noopener" className="min-h-9 inline-flex items-center hover:text-bone">
              @{SITE.owner.instagram}
            </a>
            <Link href="/refund-policy" className="min-h-9 inline-flex items-center hover:text-bone">
              Refund policy
            </Link>
            <Link href="/terms" className="min-h-9 inline-flex items-center hover:text-bone">
              Terms
            </Link>
            <Link href="/privacy" className="min-h-9 inline-flex items-center hover:text-bone">
              Privacy
            </Link>
          </nav>
        </div>
        <p className="mt-8 max-w-2xl text-[12px] leading-relaxed">
          Disclaimer: {SITE.name} is an educational product. It teaches a method for running one Meta ad with a lead
          form. It does not sell leads, collabs, or income. Results depend on your followers, your rate and how fast
          you reply. Nothing on this page is a guarantee of earnings. Not affiliated with Meta or Instagram.
        </p>
      </Container>
    </footer>
  );
}
