import { HONEST_LINE } from "@/lib/offer.config";

/** Sits near every CTA group. Required by the brand rules. */
export function HonestLine({ className = "" }: { className?: string }) {
  return <p className={`text-xs leading-relaxed text-bone-3 ${className}`}>{HONEST_LINE}</p>;
}
