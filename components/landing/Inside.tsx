import { Section, Eyebrow } from "@/components/ui";
import { CHAPTERS } from "@/lib/offer.config";
import { SITE } from "@/lib/site.config";

export function Inside() {
  return (
    <Section tone="ink-2" wide>
      <Eyebrow>Inside</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">6 chapters. {SITE.course.durationLabel}.</h2>
      <p className="mt-3 text-bone-2">
        Recorded in {SITE.course.language}. Watch once, set up the same evening.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {CHAPTERS.map((c) => (
          <li key={c.n} className="flex gap-4 rounded-card border border-ink-4 bg-ink p-5">
            <span className="display text-3xl text-lime tnum">{String(c.n).padStart(2, "0")}</span>
            <div>
              <h3 className="display text-xl">{c.title}</h3>
              <p className="mt-1 text-sm text-bone-2">{c.blurb}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
