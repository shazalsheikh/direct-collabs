"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Screenshot } from "@/lib/proof.config";

/** Tap to zoom. Native <dialog>, no library. */
export function MediaGrid({ items, label }: { items: Screenshot[]; label: string }) {
  const [open, setOpen] = useState<Screenshot | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">{label}</p>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((m, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setOpen(m)}
              className="block w-full overflow-hidden rounded-xl border border-ink-4 bg-ink-2"
              aria-label={`Zoom: ${m.alt || m.caption}`}
            >
              <Image
                src={m.src}
                alt={m.alt}
                width={m.width ?? 540}
                height={m.height ?? 960}
                className="aspect-[9/16] w-full object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </button>
            {m.caption && <p className="mt-1.5 text-[12px] text-bone-3">{m.caption}</p>}
          </li>
        ))}
      </ul>

      <dialog
        ref={ref}
        onClose={() => setOpen(null)}
        className="m-auto max-h-[92vh] w-[min(92vw,480px)] rounded-2xl border border-ink-4 bg-ink p-2 text-bone backdrop:bg-black/80"
      >
        {open && (
          <div>
            <Image
              src={open.src}
              alt={open.alt}
              width={open.width ?? 540}
              height={open.height ?? 960}
              className="max-h-[80vh] w-full rounded-xl object-contain"
              sizes="92vw"
            />
            {open.caption && <p className="px-2 pt-2 text-sm text-bone-2">{open.caption}</p>}
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="mt-2 min-h-11 w-full rounded-pill bg-ink-3 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
