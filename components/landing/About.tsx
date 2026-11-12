import Image from "next/image";
import { Section, Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site.config";

export function About() {
  const o = SITE.owner;
  return (
    <Section wide>
      <div className="grid gap-8 sm:grid-cols-[140px_1fr] sm:items-start">
        {o.photo ? (
          <Image
            src={o.photo}
            alt={o.name}
            width={280}
            height={280}
            className="h-[140px] w-[140px] rounded-card object-cover"
            sizes="140px"
          />
        ) : (
          <div className="display grid h-[140px] w-[140px] place-items-center rounded-card border border-ink-4 bg-ink-2 text-4xl text-bone-3">
            SS
          </div>
        )}
        <div>
          <Eyebrow>Who made this</Eyebrow>
          <h2 className="display mt-3 text-3xl sm:text-4xl">{o.name}</h2>
          <p className="mt-4 text-bone-2">
            I work with brands every day through {o.agency}, my marketing agency. So I see how brand owners pick creators, and why most creators never hear from
            them. DirectCollabs is the system I built to fix that. Brand owners come to the creator, and the deal stays between the two of them.
          </p>
          {o.showSchoolLine && <p className="mt-2 text-bone-2">{o.schoolLine}</p>}
          <a
            href={o.instagramUrl}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex min-h-11 items-center text-sm text-bone-3 underline underline-offset-4 hover:text-bone"
          >
            @{o.instagram}
          </a>
        </div>
      </div>
    </Section>
  );
}
