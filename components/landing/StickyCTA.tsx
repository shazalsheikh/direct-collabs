"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/offer.config";
import { rs } from "@/lib/format";

/** Mobile only. Appears once the hero has scrolled past. */
export function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById("hero-end");
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setShow(e.boundingClientRect.top < 0 && !e.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <Link
        href="/checkout?plan=pro"
        tabIndex={show ? 0 : -1}
        className="flex min-h-14 items-center justify-center rounded-pill bg-lime text-base font-semibold text-ink shadow-[0_-10px_40px_rgba(0,0,0,0.6)]"
      >
        Get the course · {rs(PLANS.pro.price)}
      </Link>
    </div>
  );
}
