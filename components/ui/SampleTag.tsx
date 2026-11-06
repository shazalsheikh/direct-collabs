/** Every mock UI element carries this. Never pass a sample off as real. */
export function SampleTag({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Sample, not real data"
      className={`inline-block rounded-[4px] border border-bone-3 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-bone-3 ${className}`}
    >
      Sample
    </span>
  );
}
