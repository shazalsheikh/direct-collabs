import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-pill select-none transition-[transform,background-color,border-color] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // Lime fill. The one loud thing on the page.
  primary: "bg-lime text-ink hover:bg-[#d6ff5c]",
  ghost: "bg-transparent text-bone hover:bg-ink-3",
  outline: "bg-transparent text-bone border border-ink-4 hover:border-bone-3",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-[15px]",
  lg: "min-h-14 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "lg", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "lg", className = "", ...rest }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

export function LinkButton({ href, variant = "primary", size = "lg", className = "", ...rest }: LinkButtonProps) {
  return <Link href={href} className={buttonClass(variant, size, className)} {...rest} />;
}
