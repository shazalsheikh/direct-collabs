import type { Metadata } from "next";
import { LegalPage, H, UL, Contact } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site.config";

export const metadata: Metadata = { title: "Privacy", description: "What DirectCollabs collects and why." };

export default function Privacy() {
  return (
    <LegalPage title="Privacy" intro="We collect what we need to take your payment, give you access and measure our ads. Nothing is sold.">
      <H>What we collect</H>
      <UL>
        <li>Your name, WhatsApp number, email and Instagram handle, when you start checkout. We save these when you finish the name and WhatsApp fields so we can follow up if checkout is interrupted.</li>
        <li>Your payment receipt (an image or PDF) and the name on the account you paid from.</li>
        <li>Order details: plan, add-on, amount, status, and your access link.</li>
        <li>Campaign data from the link you arrived on (UTM tags, Meta click id) and the Meta cookies <code>_fbp</code> and <code>_fbc</code> if you have them.</li>
        <li>Basic usage data from Meta Pixel and Google Analytics once those are switched on.</li>
      </UL>

      <H>Why</H>
      <UL>
        <li>To verify your payment and unlock the course.</li>
        <li>To message you about your order on email and WhatsApp.</li>
        <li>To reply to refund and support requests.</li>
        <li>To measure which ads lead to purchases, including sending a purchase event to Meta with your email and phone number hashed.</li>
      </UL>

      <H>Who handles it</H>
      <UL>
        <li>Supabase stores orders and receipts in a private database and storage bucket.</li>
        <li>An AI vision service reads the receipt image to check amount, receiver and date. A person reviews anything it cannot confirm.</li>
        <li>Resend sends your access email.</li>
        <li>Meta and Google receive tracking events described above.</li>
        <li>Netlify hosts the site.</li>
      </UL>
      <p>We do not sell your data and do not share it with brands or anyone else.</p>

      <H>How long we keep it</H>
      <p>
        Order and receipt records are kept while needed for accounting, refunds and disputes, then deleted. Abandoned checkouts that never paid are deleted after a reasonable period.
      </p>

      <H>Your choices</H>
      <p>
        You can ask us to see, correct or delete your data. Deletion of a paid order may be limited by what we must keep for accounting. You can block the Meta and Google
        cookies in your browser and the site will still work.
      </p>

      <H>Contact</H>
      <Contact />
      <p className="text-[13px] text-bone-3">{SITE.legal.entity}, {SITE.legal.city}.</p>
    </LegalPage>
  );
}
