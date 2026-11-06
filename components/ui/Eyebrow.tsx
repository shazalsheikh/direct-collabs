import type { ReactNode } from "react";

export function Eyebrow({ children, lime = false }: { children: ReactNode; lime?: boolean }) {
  return (
    <p className={`text-xs font-semibold tracking-[0.18em] uppercase ${lime ? "text-lime" : "text-bone-3"}`}>
      {children}
    </p>
  );
}
