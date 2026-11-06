import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  lime = false,
}: {
  children: ReactNode;
  className?: string;
  lime?: boolean;
}) {
  return (
    <div
      className={`rounded-card border bg-ink-2 p-5 sm:p-6 ${lime ? "border-lime" : "border-ink-4"} ${className}`}
    >
      {children}
    </div>
  );
}
