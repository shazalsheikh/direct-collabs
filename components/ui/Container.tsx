import type { ReactNode } from "react";

/** 16px gutter on phones, 640px readable column by default. */
export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto w-full px-4 sm:px-6 ${wide ? "max-w-5xl" : "max-w-2xl"} ${className}`}>
      {children}
    </div>
  );
}
