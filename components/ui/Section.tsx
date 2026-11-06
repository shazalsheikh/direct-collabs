import type { ReactNode } from "react";
import { Container } from "./Container";

/** Consistent vertical rhythm. One lime highlight per section lives in the children. */
export function Section({
  id,
  children,
  className = "",
  wide = false,
  tone = "ink",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  wide?: boolean;
  tone?: "ink" | "ink-2";
}) {
  const bg = tone === "ink-2" ? "bg-ink-2" : "bg-ink";
  return (
    <section id={id} className={`${bg} py-16 sm:py-24 ${className}`}>
      <Container wide={wide}>{children}</Container>
    </section>
  );
}
