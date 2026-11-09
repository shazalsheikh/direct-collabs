import { Container } from "@/components/ui";
import { visibleStats } from "@/lib/proof.config";
import { num } from "@/lib/format";

export function ProofBar() {
  const stats = visibleStats();
  if (stats.length === 0) return null;
  return (
    <section className="border-y border-ink-4 bg-ink-2 py-8">
      <Container wide>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id}>
              <dd className="display tnum whitespace-nowrap text-2xl sm:text-4xl">
                {!s.verified && <span className="text-bone-3">~</span>}
                {s.prefix}
                {num(s.value as number)}
                {s.suffix}
              </dd>
              <dt className="mt-1 text-[13px] text-bone-3">{s.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[13px] text-bone-3">
          One ad. One lead form. Rounded numbers from Meta and the creator. Brand names hidden.
        </p>
      </Container>
    </section>
  );
}
