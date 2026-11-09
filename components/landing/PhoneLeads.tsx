"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SampleTag } from "@/components/ui";

/**
 * Hero surprise: a phone frame where "New lead" cards slide in one by one.
 * Pure HTML/CSS. Every card is a SAMPLE. Respects prefers-reduced-motion.
 */
/**
 * What the brand wants from the creator, and where.
 * Product collabs: the brand ships to the creator, so no city, just "Shipped to you".
 * Visit collabs (cafe, salon, restaurant): the creator has to go there, so the city matters.
 */
const SAMPLE_LEADS = [
  { cat: "Clothing", ask: "Video content of the dress", budget: "Rs 20k to 40k", handle: "@na••••wear", where: "Shipped to you" },
  { cat: "Cafe", ask: "Cafe visit", budget: "Rs 8k to 12k", handle: "@th••••cafe", where: "Islamabad" },
  { cat: "Skincare", ask: "Unboxing video", budget: "Rs 15k to 25k", handle: "@gl••••skin", where: "Shipped to you" },
  { cat: "Salon", ask: "Salon visit", budget: "Rs 12k to 18k", handle: "@lu••••salon", where: "Lahore" },
  { cat: "Restaurant", ask: "Dinner visit", budget: "Rs 25k to 35k", handle: "@ka••••grill", where: "Lahore" },
  { cat: "Jewellery", ask: "Reel with the new collection", budget: "Rs 4k to 7k", handle: "@sa••••jewels", where: "Shipped to you" },
  { cat: "Bakery", ask: "Bakery visit", budget: "Rs 3k to 5k", handle: "@su••••bakes", where: "Islamabad" },
];

const VISIBLE = 3;

const RM = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function PhoneLeads() {
  const [count, setCount] = useState(VISIBLE); // how many leads have "arrived"
  // Server snapshot = reduced (static). Client reads the real preference.
  const reduced = useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => true);
  const animate = !reduced;

  useEffect(() => {
    if (reduced) return; // static stack of 3
    const t = setInterval(() => setCount((c) => c + 1), 2200);
    return () => clearInterval(t);
  }, [reduced]);

  // Window of the last VISIBLE leads, newest first.
  const items = Array.from({ length: VISIBLE }, (_, i) => {
    const idx = count - 1 - i;
    return { ...SAMPLE_LEADS[((idx % SAMPLE_LEADS.length) + SAMPLE_LEADS.length) % SAMPLE_LEADS.length], key: idx };
  });

  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]" aria-hidden="true">
      {/* Phone frame */}
      <div className="rounded-[2.2rem] border border-ink-4 bg-ink-2 p-2.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="relative overflow-hidden rounded-[1.8rem] bg-ink">
          {/* Notch */}
          <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-ink-3" />

          {/* Toast */}
          <div
            key={`toast-${count}`}
            className={`mx-3 mt-3 flex items-center gap-2.5 rounded-xl bg-ink-3 px-3 py-2 ${animate ? "animate-toast-in" : ""}`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-bone text-ink text-[11px] font-bold">
              IG
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-tight">New lead</p>
              <p className="truncate text-[11px] text-bone-2">A brand owner filled your form</p>
            </div>
            <span className="ml-auto text-[11px] text-bone-2">now</span>
          </div>

          {/* Lead Center header */}
          <div className="mt-4 flex items-center justify-between px-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">Lead Center</p>
              <p className="display text-xl">Leads</p>
            </div>
            <SampleTag />
          </div>

          {/* Lead card stack */}
          <ul className="mt-3 h-[320px] space-y-2 overflow-hidden px-3">
            {items.map((l, i) => (
              <li
                key={l.key}
                className={`rounded-2xl border border-ink-4 bg-ink-2 p-3 ${i === 0 && animate ? "animate-lead-in" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-ink-3 px-2 py-0.5 text-[11px] font-semibold">{l.cat}</span>
                  <span className="text-[11px] text-bone-2">{l.where}</span>
                </div>
                <p className="mt-2 text-[15px] font-semibold leading-snug">{l.ask}</p>
                <p className="tnum mt-0.5 text-[13px] text-bone-2">{l.budget}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[12px] text-bone-2 blur-[1.5px] select-none">{l.handle}</span>
                  <span className="text-[11px] font-semibold text-lime">Paid collab</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
