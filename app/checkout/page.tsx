import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm, CheckoutWithParams } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/** The IC page. No nav. Sticky summary. ?plan= overrides the default. */
export default function CheckoutPage() {
  return (
    <main className="flex-1">
      <Suspense fallback={<CheckoutForm initialPlan="pro" />}>
        <CheckoutWithParams />
      </Suspense>
    </main>
  );
}
