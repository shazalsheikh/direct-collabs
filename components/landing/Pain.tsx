import { Section, Card } from "@/components/ui";

const PAINS = [
  "Agency se collab milti hai, par 30% kat ke.",
  "Brand ko DM kro, seen. Reply nhi.",
  "Jo aata hai wo barter. Kapray, products. Bills nahi.",
];

export function Pain() {
  return (
    <Section wide>
      <div className="grid gap-3 sm:grid-cols-3">
        {PAINS.map((p, i) => (
          <Card key={i}>
            <span className="text-xs font-semibold text-bone-3">0{i + 1}</span>
            <p className="display mt-3 text-2xl">{p}</p>
          </Card>
        ))}
      </div>
      <p className="mt-10 max-w-2xl text-xl leading-snug sm:text-2xl">
        Masla ap ka content nahi. Masla ye hai ke brands ap tak pohnchte hi nahi.{" "}
        <span className="text-lime">Ye system wo fix krta hai.</span>
      </p>
    </Section>
  );
}
