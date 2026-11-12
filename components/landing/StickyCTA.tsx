"use client";

import { useEffect, useState } from "react";

/** Mobile only. Appears once the hero has scrolled past, and hides while the application form is on screen. */
export function StickyCTA() {
  const [pastHero, setPastHero] = useState(false);
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-end");
    const form = document.getElementById("apply");
    const ios: IntersectionObserver[] = [];
    if (hero) {
      const io = new IntersectionObserver(([e]) => setPastHero(e.boundingClientRect.top < 0 && !e.isIntersecting), { threshold: 0 });
      io.observe(hero);
      ios.push(io);
    }
    if (form) {
      const io = new IntersectionObserver(([e]) => setAtForm(e.isIntersecting), { threshold: 0.05 });
      io.observe(form);
      ios.push(io);
    }
    return () => ios.forEach((io) => io.disconnect());
  }, []);

  const show = pastHero && !atForm;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
      aria-hidden={!show}
    >
      <a
        href="#apply"
        tabIndex={show ? 0 : -1}
        className="flex min-h-14 items-center justify-center rounded-pill bg-lime text-base font-semibold text-ink shadow-[0_-10px_40px_rgba(0,0,0,0.6)]"
      >
        Apply to work with us
      </a>
    </div>
  );
}
