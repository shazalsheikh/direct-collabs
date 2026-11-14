"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { PLANS, UPGRADE, AD_BUDGET, PAY_IN_2 } from "@/lib/offer.config";
import { SITE, whatsappLink } from "@/lib/site.config";
import { rs } from "@/lib/format";
import { HonestLine } from "@/components/ui";
import { trackPurchaseClient } from "@/lib/track";

type Status = {
  ref: string;
  status: "Lead" | "Submitted" | "Approved" | "Needs review" | "Rejected";
  plan: "basic" | "pro" | "coaching";
  kind: "purchase" | "upgrade" | "second";
  bump: boolean;
  amount: number;
  pay_in_2: { enabled: boolean; first: number; second: number; due_at: string; first_paid: boolean; second_paid?: boolean } | null;
  event_id: string | null;
  email_on?: boolean;
  access_token: string | null;
};

const POLL_MS = 20_000;

export function ThankYou({ orderRef }: { orderRef: string | null }) {
  const ref = orderRef;
  const [s, setS] = useState<Status | null>(null);
  const [err, setErr] = useState<"none" | "notfound" | "unavailable">("none");
  const online = useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );

  useEffect(() => {
    if (!ref) return;
    let stop = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch(`/api/order/${ref}/status`, { cache: "no-store" });
        if (res.status === 404) setErr("notfound");
        else if (res.status === 503) setErr("unavailable");
        else if (res.ok) {
          const j = (await res.json()) as Status;
          setErr("none");
          setS(j);
          if (j.status === "Approved") {
            trackPurchaseClient({ ref: j.ref, value: j.pay_in_2?.enabled && !j.pay_in_2.second_paid && j.kind === "purchase" ? j.pay_in_2.first + Math.max(0, j.amount - j.pay_in_2.first - j.pay_in_2.second) : j.amount, eventId: j.event_id });
            return; // stop polling
          }
        }
      } catch {}
      if (!stop) t = setTimeout(tick, POLL_MS);
    };
    void tick();
    return () => {
      stop = true;
      clearTimeout(t);
    };
  }, [ref]);

  const step = s?.status === "Approved" ? 3 : s?.status === "Submitted" || s?.status === "Needs review" ? 2 : s ? 1 : 1;
  const review = s?.status === "Needs review";
  const planName = s ? (s.kind === "upgrade" ? "Upgrade to Pro" : s.kind === "second" ? "Second payment" : PLANS[s.plan].name) : "";
  // Promise email only when the server can really send it.
  const shareWhere = s?.email_on ? "on WhatsApp and to the email you gave" : "on WhatsApp";
  const coaching = s?.plan === "coaching";
  const wa = whatsappLink(`Order ${ref ?? ""}, ${planName}, paid ${s ? rs(s.pay_in_2?.enabled && !s.pay_in_2.first_paid ? s.pay_in_2.first : s.amount) : ""}`);
  const dfy = SITE.flags.showDoneForYou ? whatsappLink(`Hi, order ${ref ?? ""}. I want the done-for-you setup.`) : "";

  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime">Order {ref ?? "…"}</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">
        {s?.status === "Approved" ? (coaching ? "You are in." : "Access unlocked.") : s?.status === "Lead" ? "One more step." : "Thank you!"}
      </h1>

      {!ref && (
        <p className="mt-4 text-bone-2">
          No order reference in this link. If you just paid, go back to the page you were on after paying, or{" "}
          <Link href="/checkout" className="underline underline-offset-4">
            go back to checkout
          </Link>
          .
        </p>
      )}
      {err === "notfound" && <p className="mt-4 text-coral">We could not find that order. Check the link, or WhatsApp us.</p>}
      {err === "unavailable" && <p className="mt-4 text-coral">Status is not available right now. Your receipt is safe. Check back in a few minutes.</p>}
      {!online && <p className="mt-4 text-coral">You are offline. We will keep checking when you are back.</p>}

      {/* Timeline */}
      <ol className="mt-8 space-y-0">
        <Step n={1} active={step >= 1} done={step > 1} title="Payment screenshot received" body="We have your screenshot and your details." />
        <Step
          n={2}
          active={step >= 2}
          done={step > 2}
          title={coaching ? "I am checking your payment" : "We are checking your payment"}
          body={
            coaching
              ? "I am confirming your payment. Then I will message you on WhatsApp to confirm the terms and book your first call."
              : `We are confirming your payment. Then we will share your course link ${shareWhere}. If you keep this page open, it unlocks by itself.`
          }
        />
        <Step
          n={3}
          active={step >= 3}
          done={step >= 3}
          title={coaching ? "Your first call is booked" : "Course link shared"}
          body={
            coaching
              ? "I will message you on WhatsApp to confirm the terms and book your first Zoom call, within your first 10 days."
              : `We will share your course link ${shareWhere} soon. It also appears on this page once your payment is confirmed.`
          }
          last
        />
      </ol>

      {s?.status === "Approved" && s.access_token && !coaching && (
        <Link href={`/access/${s.access_token}`} className="mt-6 flex min-h-14 w-full items-center justify-center rounded-pill bg-lime text-base font-semibold text-ink">
          Watch now
        </Link>
      )}
      {s?.status === "Approved" && coaching && wa && (
        <a href={wa} className="mt-6 flex min-h-14 w-full items-center justify-center rounded-pill bg-lime text-base font-semibold text-ink">
          Message me on WhatsApp to book your call
        </a>
      )}
      {review && wa && (
        <a href={wa} className="mt-6 flex min-h-12 w-full items-center justify-center rounded-pill border border-bone-3 text-sm font-semibold text-bone">
          Questions? Message us on WhatsApp
        </a>
      )}
      {s && s.status === "Lead" && (
        <Link href="/checkout" className="mt-6 flex min-h-14 w-full items-center justify-center rounded-pill bg-lime text-base font-semibold text-ink">
          Upload your receipt
        </Link>
      )}

      {/* Pay-in-2 second part */}
      {s?.pay_in_2?.enabled && s.pay_in_2.first_paid && !s.pay_in_2.second_paid && s.kind === "purchase" && (
        <div className="mt-8 rounded-card border border-ink-4 bg-ink-2 p-5">
          <p className="display text-xl">Second part: {rs(s.pay_in_2.second)}</p>
          <p className="mt-1 text-sm text-bone-2">Due {new Date(s.pay_in_2.due_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}. Same bank details, same flow.</p>
          <Link href={`/checkout?second=${s.ref}`} className="mt-3 inline-flex min-h-11 items-center rounded-pill border border-bone-3 px-4 text-sm font-semibold">
            Pay part 2
          </Link>
        </div>
      )}

      {/* Basic upgrade */}
      {s?.plan === "basic" && s.kind === "purchase" && s.status === "Approved" && (
        <div className="mt-10 rounded-card border-2 border-lime bg-ink-2 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime">One more thing</p>
          <h2 className="display mt-2 text-2xl">Add Pro for {rs(UPGRADE.price)}</h2>
          <p className="mt-2 text-sm text-bone-2">
            5 scripts, 20 DM replies, the rate card. Same link, unlocked once we verify the upgrade.
          </p>
          <Link href={`/checkout?upgrade=${s.ref}`} className="mt-4 flex min-h-12 w-full items-center justify-center rounded-pill bg-lime text-sm font-semibold text-ink">
            Upgrade · {rs(UPGRADE.price)}
          </Link>
        </div>
      )}

      {/* Flag-hidden done-for-you */}
      {dfy && (
        <div className="mt-6 rounded-card border border-ink-4 bg-ink-2 p-5">
          <h2 className="display text-xl">Want it done for you?</h2>
          <p className="mt-1 text-sm text-bone-2">We set up the ad and the form on your page with you on a call.</p>
          <a href={dfy} className="mt-3 inline-flex min-h-11 items-center rounded-pill border border-bone-3 px-4 text-sm font-semibold">
            Ask on WhatsApp
          </a>
        </div>
      )}

      <HonestLine className="mt-10" />
      {PAY_IN_2.enabled && <span className="sr-only">pay in 2 enabled</span>}
    </div>
  );
}

function Step({ n, active, done, title, body, warn, last }: { n: number; active: boolean; done: boolean; title: string; body: string; warn?: boolean; last?: boolean }) {
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
            done ? "bg-lime text-ink" : active ? (warn ? "border-2 border-coral text-coral" : "border-2 border-lime text-lime") : "border border-ink-4 text-bone-3"
          }`}
        >
          {done ? "✓" : n}
        </span>
        {!last && <span className={`my-1 w-px flex-1 ${done ? "bg-lime" : "bg-ink-4"}`} aria-hidden="true" />}
      </div>
      <div className={`pb-7 ${active ? "" : "opacity-50"}`}>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-bone-2">{body}</p>
      </div>
    </li>
  );
}
