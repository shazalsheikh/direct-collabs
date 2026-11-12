import type { Metadata } from "next";
import { LegalPage, H, UL, Contact } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site.config";

export const metadata: Metadata = { title: "Terms", description: "Terms of use for DirectCollabs.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <LegalPage title="Terms" intro={`By applying to or working with ${SITE.name} you agree to these terms. They are short on purpose.`}>
      <H>What we do</H>
      <p>
        {SITE.name} is a service for content creators. We set up and run a system that helps brand owners reach you directly. We do not sell brand deals, and we are not
        a talent agency.
      </p>

      <H>Applying</H>
      <UL>
        <li>Sending an application does not commit you to anything, and no payment is taken on this website.</li>
        <li>We review each application and may decide a page is not a fit.</li>
        <li>If we go ahead, the plan, the price and how long we work together are agreed with you in writing on WhatsApp before you pay anything.</li>
      </UL>

      <H>No income promise</H>
      <p>
        We bring brand owners to you. Whether they hire you depends on your content, your followers, your rate and how fast you reply. Nothing on this site or in our
        marketing is a guarantee of brand deals or earnings. Results shown on the site are those creators&apos; own results and are rounded.
      </p>

      <H>Your deals are yours</H>
      <UL>
        <li>Brand owners deal with you directly. We take no percentage of your deals.</li>
        <li>Any agreement you make with a brand is between you and that brand. You are responsible for delivering the work, for your content and for your own taxes.</li>
      </UL>

      <H>Your account</H>
      <p>
        You stay the owner of your Instagram account and are responsible for following Instagram&apos;s rules. Instagram can limit or restrict accounts. We are not
        affiliated with Instagram or Meta and are not responsible for their decisions.
      </p>

      <H>Liability</H>
      <p>
        To the extent the law allows, our liability for any claim about our service is limited to the amount you paid us. We are not liable for lost income, account
        restrictions or decisions you make in your dealings with brands.
      </p>

      <H>Law and changes</H>
      <p>
        These terms are governed by the laws of Pakistan. We may update them and the date at the top will change. What we agreed with you in writing applies to your work
        with us.
      </p>

      <H>Contact</H>
      <Contact />
      <p>
        {SITE.legal.entity}, {SITE.legal.city}.
      </p>
    </LegalPage>
  );
}
