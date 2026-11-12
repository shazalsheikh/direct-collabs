import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SITE } from "@/lib/site.config";
import { CheckoutForm, CheckoutWithParams } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/** The IC page. No nav. Sticky summary. ?plan= overrides the default. */
export default function CheckoutPage() {
  // Checkout is closed: the site takes applications now.
  if (!SITE.flags.checkoutOpen) redirect("/#apply");
  return (
    <main className="flex-1">
      <Suspense fallback={<CheckoutForm initialPlan="pro" />}>
        <CheckoutWithParams />
      </Suspense>
    </main>
  );
}
