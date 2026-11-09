import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, H, UL, Contact } from "@/components/legal/LegalPage";
import { PLANS, AD_BUDGET, PAY_IN_2, COACHING, COACHING_TOTAL } from "@/lib/offer.config";
import { SITE } from "@/lib/site.config";
import { rs } from "@/lib/format";

export const metadata: Metadata = { title: "Terms", description: "Terms of use for DirectCollabs.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <LegalPage title="Terms" intro={`By paying for ${SITE.name} you agree to these terms. They are short on purpose.`}>
      <H>What you are buying</H>
      <p>
        {PLANS.pro.name} ({rs(PLANS.pro.price)}): a recorded course in {SITE.course.language} ({SITE.course.durationLabel}) with the templates, scripts and sheets listed on the course page. It is
        an educational product. We do not sell leads, collabs or brand deals.
      </p>

      <H>1-on-1 coaching</H>
      <p>
        {COACHING.name} is bought through the checkout page like the course. The full price is {rs(COACHING_TOTAL)}. You pay {rs(COACHING.upfront)} to start. The other {rs(COACHING.successFee)} is due only
        if brand deals that came through your system have paid you {rs(COACHING.revenueTarget)} or more within {COACHING.windowMonths} months of your first ad going live, shown by your payment
        screenshots. If the total stays below that, you owe nothing more. You agree to these terms at checkout, and we confirm them in writing on WhatsApp when we book your first call. We do not promise any amount of income.
      </p>

      <H>No income promise</H>
      <p>
        We teach a method for running one Meta ad with an Instagram lead form. Results depend on your followers, your rate and how fast you reply. Nothing here or in our
        ads is a guarantee of earnings. Any performance guarantee we offer is only the one written on the{" "}
        <Link href="/refund-policy" className="text-bone underline underline-offset-4">refund policy</Link> page.
      </p>

      <H>Ad spend is separate</H>
      <p>
        The method needs {rs(AD_BUDGET.minPerDay)} to {rs(AD_BUDGET.maxPerDay)} a day of your own ad spend. You pay it to Meta. You are responsible for your ads, your
        account, your content and following Meta&apos;s advertising policies. Meta can reject ads or restrict accounts. We are not affiliated with Meta or Instagram and are not
        responsible for their decisions.
      </p>

      <H>Payment and access</H>
      <UL>
        <li>You pay by Easypaisa or JazzCash and upload the receipt on the checkout page.</li>
        <li>We verify each receipt, automatically or by hand. After verification your access appears on your thank-you page and we send the link on WhatsApp. We may also email it.</li>
        <li>A receipt that does not match the order amount, receiver, date or that has been used before will not be approved.</li>
        <li>Prices are in Pakistani rupees.</li>
      </UL>
      {PAY_IN_2.enabled && (
        <p>
          Pay in 2: {rs(PAY_IN_2.first)} now and {rs(PAY_IN_2.second)} within {PAY_IN_2.daysBetween} days. Access unlocks after the first part. If the second part is not paid we
          may pause access until it is.
        </p>
      )}

      <H>Your access is personal</H>
      <p>
        Your link is for you only. Do not share, resell or re-upload the course, scripts or templates. We may end access without refund if we find the link shared publicly.
      </p>

      <H>Changes to the course</H>
      <p>
        Meta changes its ad tools often. We may update the course and files over time but do not promise any specific update or that every screen will match.
      </p>

      <H>Liability</H>
      <p>
        To the extent the law allows, our liability for any claim about the course is limited to the amount you paid. We are not liable for ad spend, lost income, account
        restrictions or decisions you make with the material.
      </p>

      <H>Law and changes</H>
      <p>
        These terms are governed by the laws of Pakistan. We may update them and the date at the top will change. The version in force when you pay is the one that applies to
        your order.
      </p>

      <H>Contact</H>
      <Contact />
      <p className="text-[13px] text-bone-3">{SITE.legal.entity}, {SITE.legal.city}.</p>
    </LegalPage>
  );
}
