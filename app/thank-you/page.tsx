import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ThankYou } from "@/components/thankyou/ThankYou";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

export default function ThankYouPage(props: PageProps<"/thank-you">) {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <Link href="/" className="display inline-flex min-h-11 items-center text-lg">
          Direct<span className="text-lime">Collabs</span>
        </Link>
        <Suspense fallback={<p className="mt-8 text-bone-3">Loading your order…</p>}>
          <ThankYouFromParams searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function ThankYouFromParams(props: { searchParams: PageProps<"/thank-you">["searchParams"] }) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.order) ? sp.order[0] : sp.order;
  const ref = raw && /^DC-[A-Z0-9]{4}$/.test(raw) ? raw : null;
  return <ThankYou orderRef={ref} />;
}
