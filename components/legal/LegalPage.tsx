import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site.config";

/** Shared shell for /refund-policy, /terms, /privacy. Plain, readable, mobile first. */
export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8">
        <Link href="/" className="display inline-flex min-h-11 items-center text-lg">
          Direct<span className="text-lime">Collabs</span>
        </Link>
        <h1 className="display mt-8 text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-3 text-[13px] text-bone-3">Last updated {SITE.legal.lastUpdated}</p>
        {intro && <p className="mt-5 text-lg text-bone-2">{intro}</p>}
        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-bone-2">{children}</div>
        <nav className="mt-12 flex flex-wrap gap-x-6 border-t border-ink-4 pt-3 text-sm text-bone-3">
          {([["/refund-policy", "Refund policy"], ["/terms", "Terms"], ["/privacy", "Privacy"], ["/", "Home"]] as const).map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-bone">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

export const H = ({ children }: { children: ReactNode }) => <h2 className="display !mt-10 text-2xl text-bone">{children}</h2>;

export const UL = ({ children }: { children: ReactNode }) => <ul className="list-disc space-y-2 pl-5 marker:text-bone-3">{children}</ul>;

export function Contact() {
  return (
    <p>
      {SITE.supportEmail && (
        <>
          Email{" "}
          <a href={`mailto:${SITE.supportEmail}`} className="text-bone underline underline-offset-4">
            {SITE.supportEmail}
          </a>
          ,{" "}
        </>
      )}
      {SITE.whatsappNumber && (
        <>
          WhatsApp{" "}
          <a href={`https://wa.me/${SITE.whatsappNumber}`} className="text-bone underline underline-offset-4">
            +{SITE.whatsappNumber}
          </a>
          ,{" "}
        </>
      )}
      or message @{SITE.owner.instagram} on Instagram.
    </p>
  );
}
