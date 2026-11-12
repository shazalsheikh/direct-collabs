import type { Metadata } from "next";
import { LegalPage, H, UL, Contact } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site.config";

export const metadata: Metadata = { title: "Privacy", description: "What DirectCollabs collects and why.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <LegalPage title="Privacy" intro="We collect what we need to review your application and contact you. Nothing is sold.">
      <H>What we collect</H>
      <UL>
        <li>What you put in the application: your name, WhatsApp number, Instagram handle, follower range, what you charge, and any note you add.</li>
        <li>Campaign data from the link you arrived on (UTM tags and click ids), and the Meta cookies _fbp and _fbc if you have them.</li>
        <li>Basic usage data from Meta Pixel and Google Analytics once those are switched on.</li>
        <li>If you work with us, what you share with us on WhatsApp to do the work.</li>
        <li>If you paid through this site in the past, your order and payment receipt.</li>
      </UL>

      <H>Why</H>
      <UL>
        <li>To review your application and message you about it, mainly on WhatsApp.</li>
        <li>To do the work we agreed with you.</li>
        <li>To measure which of our marketing brings applications, including sending an event to Meta with your details hashed.</li>
      </UL>

      <H>Who handles it</H>
      <UL>
        <li>Supabase stores applications in a private database.</li>
        <li>Netlify hosts the site.</li>
        <li>Meta and Google receive the tracking events described above.</li>
      </UL>
      <p>We do not sell your data and do not share your application with brands or anyone else.</p>

      <H>How long we keep it</H>
      <p>Applications are kept while we are in touch with you, then deleted. Payment records are kept as long as needed for accounting.</p>

      <H>Your choices</H>
      <p>
        You can ask us to see, correct or delete your data. You can block the Meta and Google cookies in your browser and the site will still work.
      </p>

      <H>Contact</H>
      <Contact />
      <p>
        {SITE.legal.entity}, {SITE.legal.city}.
      </p>
    </LegalPage>
  );
}
