import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Landing } from "@/components/landing/Landing";
import { HEROES, type VariantId } from "@/lib/heroes";

// Variant pages exist only to be rewrite targets. Keep them out of search; canonical is "/".
export const metadata: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: "/" } };

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6, 7].map((n) => ({ variant: String(n) }));
}

export default async function VariantPage(props: PageProps<"/v/[variant]">) {
  const { variant } = await props.params;
  const n = Number(variant);
  if (!Number.isInteger(n) || n < 1 || n > 7) notFound();
  return <Landing hero={HEROES[n as VariantId]} />;
}
