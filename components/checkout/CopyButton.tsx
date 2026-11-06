"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
      className="min-h-9 shrink-0 rounded-pill border border-ink-4 px-3 text-xs font-semibold text-bone-2 hover:border-bone-3 hover:text-bone"
      aria-label={label ? `Copy ${label}` : "Copy"}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}
