import Link from "next/link";
import { Container } from "@/components/ui";
import { SITE, whatsappLink } from "@/lib/site.config";

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
          <nav className="grid grid-cols-2 gap-x-8 gap-y-2">
            {wa && (
              <a href={wa} className="inline-flex min-h-9 items-center hover:text-bone">
                WhatsApp
              </a>
            )}
            <a href={SITE.owner.instagramUrl} target="_blank" rel="noopener" className="inline-flex min-h-9 items-center hover:text-bone">
              @{SITE.owner.instagram}
            </a>
            <Link href="/terms" className="inline-flex min-h-9 items-center hover:text-bone">
              Terms
            </Link>
            <Link href="/privacy" className="inline-flex min-h-9 items-center hover:text-bone">
              Privacy
            </Link>
          </nav>
        </div>
        <p className="mt-8 max-w-2xl text-[12px] leading-relaxed">
          Disclaimer: {SITE.name} is a service for content creators. We do not sell brand deals or income, and nothing on this page is a guarantee of earnings. Results
          depend on your followers, your rate and how fast you reply. Not affiliated with Instagram or Meta.
        </p>
      </Container>
    </footer>
  );
}
