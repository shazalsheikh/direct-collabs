import { Section, Eyebrow, SampleTag } from "@/components/ui";
import { AD_BUDGET } from "@/lib/offer.config";
import { rs } from "@/lib/format";

export function Mechanism() {
  const steps = [
    {
      n: "1",
      title: "Ek ad lagao",
      body: `40 sec video, ${rs(AD_BUDGET.minPerDay)}/day, apni profile se.`,
    },
    {
      n: "2",
      title: "Brand owner form bharta hai",
      body: "Category, budget, handle. Paid ya barter, form pe hi clear.",
    },
    {
      n: "3",
      title: "Ap choose krte ho",
      body: "Rate ap ka, jitna charge kro utna ap ka. Payment seedha ap ko. No middle man.",
    },
  ];
  return (
    <Section tone="ink-2" wide>
      <Eyebrow>How it works</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">1 ad. 1 form. 1 yes.</h2>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
        <ol className="space-y-6">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="display grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-ink text-lg">
                {s.n}
              </span>
              <div>
                <h3 className="display text-2xl">{s.title}</h3>
                <p className="mt-1 text-bone-2">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Lead form mockup, pure CSS */}
        <div className="rounded-card border border-ink-4 bg-ink p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">Instagram form</p>
            <SampleTag />
          </div>
          <p className="display mt-2 text-lg">Collab with me</p>
          <FormRow label="Your brand category" value="Skincare" />
          <FormRow label="Budget per video" value="Rs 15,000 to 25,000" />
          <FormRow label="Instagram handle" value="@yourbrand" />
          <div className="mt-3 rounded-xl bg-ink-3 px-3 py-2 text-[12px] text-bone-2">
            <span className="font-semibold text-bone">Paid or barter?</span> Barter requests go to a different
            inbox.
          </div>
          <div className="mt-3 rounded-pill bg-bone py-2.5 text-center text-sm font-semibold text-ink">Submit</div>
        </div>
      </div>
    </Section>
  );
}

function FormRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] text-bone-3">{label}</p>
      <div className="mt-1 rounded-xl border border-ink-4 bg-ink-2 px-3 py-2 text-sm">{value}</div>
    </div>
  );
}
