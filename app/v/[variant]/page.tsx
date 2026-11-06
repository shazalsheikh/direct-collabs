import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Landing } from "@/components/landing/Landing";
import { HEROES } from "@/lib/heroes";

// Variant pages exist only to be rewrite targets. Keep them out of search; canonical is "/".
export const metadata: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: "/" } };

export function generateStaticParams() {
  return [{ variant: "1" }, { variant: "2" }, { variant: "3" }];
}

export default async function VariantPage(props: PageProps<"/v/[variant]">) {
  const { variant } = await props.params;
  const n = Number(variant);
  if (n !== 1 && n !== 2 && n !== 3) notFound();
  return <Landing hero={HEROES[n]} />;
}
