import { Section, Eyebrow } from "@/components/ui";

/**
 * What the service is and what the creator gets. It describes the outcome and the three steps,
 * never the method behind it: that is explained in person after the application.
 */
const STEPS = [
  { n: 1, title: "You apply", body: "Tell us about your page. It takes a minute." },
  { n: 2, title: "We set everything up", body: "If your page is a fit, we build and run the whole system for you. Nothing technical for you to learn." },
  { n: 3, title: "Brand owners reach out", body: "They contact you with what they need and their budget. You choose who to work with, at your rate." },
];

const GETS = [
  "Brand owners reaching out to you directly",
  "Every request comes with a category and a budget, so you know who is serious",
  "Paid requests and barter requests kept apart",
  "You set the rate, and the payment goes straight to you",
  "No agency in the middle and no percentage of your deals",
  "We run the system for you. You focus on content",
];

export function WhatWeDo() {
  return (
    <Section tone="ink-2" wide>
      <Eyebrow>What we do</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">
        We bring the brands. <span className="text-lime">You make the content.</span>
      </h2>
      <p className="mt-4 max-w-2xl text-bone-2">
        DirectCollabs is a done-for-you service for content creators. We set up and run a system on your own Instagram that makes brand owners come to you. You talk to
        them directly and close your own deals.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="rounded-card border border-ink-4 bg-ink p-5">
            <span className="display tnum grid h-9 w-9 place-items-center rounded-full bg-lime text-ink">{s.n}</span>
            <p className="display mt-4 text-2xl">{s.title}</p>
            <p className="mt-2 text-[15px] text-bone-2">{s.body}</p>
          </li>
        ))}
      </ol>

      <h3 className="display mt-12 text-2xl sm:text-3xl">What you get</h3>
      <ul className="mt-5 grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2">
        {GETS.map((g) => (
          <li key={g} className="flex gap-2.5">
            <svg className="mt-1 h-4 w-4 shrink-0 text-lime" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {g}
          </li>
        ))}
      </ul>
    </Section>
  );
}
