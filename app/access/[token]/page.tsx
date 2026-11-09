import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { DbUnavailable } from "@/lib/orders";
import { resolveAccess, canDownload, type Access } from "@/lib/access";
import { CHAPTERS, DOWNLOADS, UPGRADE, PLANS } from "@/lib/offer.config";
import { SITE, whatsappLink } from "@/lib/site.config";
import { rs } from "@/lib/format";

export const metadata: Metadata = { title: "Your course", robots: { index: false, follow: false } };

export default function AccessPage(props: PageProps<"/access/[token]">) {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <Link href="/" className="display inline-flex min-h-11 items-center text-lg">
          Direct<span className="text-lime">Collabs</span>
        </Link>
        <Suspense fallback={<p className="mt-8 text-bone-3">Checking your link…</p>}>
          <Gate params={props.params} />
        </Suspense>
      </div>
    </main>
  );
}

async function Gate({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let access: Access | null = null;
  try {
    access = await resolveAccess(token);
  } catch (err) {
    if (err instanceof DbUnavailable) return <Invalid reason="Access is not switched on yet." />;
    throw err;
  }
  if (!access) return <Invalid />;

  // Linked orders (upgrade, second payment) open the original order's content.
  const { content, isPro } = access;
  const videoUrl = process.env.COURSE_VIDEO_URL ?? "";
  const first = (content.name ?? "").split(" ")[0];
  const wa = whatsappLink(`Hi, order ${content.ref}. Question about the course.`);

  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime">
        {isPro ? PLANS.pro.name : PLANS.basic.name} · order {content.ref}
      </p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">{first ? `${first}, ` : ""}brands ko apply krne do.</h1>
      <p className="mt-3 text-bone-2">
        {SITE.course.durationLabel} in {SITE.course.language}. Watch once, set up tonight. This link is yours only, do not share it.
      </p>

      {/* Player */}
      {SITE.flags.externalInvite && SITE.flags.externalInviteUrl ? (
        <a href={SITE.flags.externalInviteUrl} className="mt-8 flex min-h-14 items-center justify-center rounded-pill bg-lime text-base font-semibold text-ink">
          Open the course
        </a>
      ) : videoUrl ? (
        <div className="mt-8 overflow-hidden rounded-card border border-ink-4 bg-ink-2">
          <iframe
            src={videoUrl}
            title="DirectCollabs course"
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="mt-8 grid aspect-video place-items-center rounded-card border border-dashed border-ink-4 bg-ink-2 px-6 text-center text-sm text-bone-2">
          {process.env.NODE_ENV !== "production" ? "Video player goes here. Set COURSE_VIDEO_URL or COURSE_INVITE_URL." : "Your payment is confirmed. Your course link is on its way, and I will also send it to you on WhatsApp."}
        </div>
      )}

      {/* Chapters */}
      <h2 className="display mt-10 text-2xl">Chapters</h2>
      <ol className="mt-4 grid gap-2">
        {CHAPTERS.map((c) => (
          <li key={c.n} className="flex items-center gap-4 rounded-xl border border-ink-4 bg-ink-2 px-4 py-3">
            <span className="display tnum text-xl text-lime">{String(c.n).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.title}</p>
              <p className="truncate text-[13px] text-bone-3">{c.blurb}</p>
            </div>
            <span className="tnum text-[12px] text-bone-3">{c.minutes} min</span>
          </li>
        ))}
      </ol>

      {/* Downloads */}
      <h2 className="display mt-10 text-2xl">Downloads</h2>
      <ul className="mt-4 grid gap-2">
        {DOWNLOADS.map((d) => {
          const isBump = "bump" in d && d.bump;
          const locked = !canDownload(d, access);
          const ready = Boolean(d.file);
          return (
            <li key={d.id} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${locked ? "border-ink-4 bg-ink opacity-70" : "border-ink-4 bg-ink-2"}`}>
              <div className="min-w-0">
                <p className="font-semibold">{d.name}</p>
                <p className="text-[12px] text-bone-3">{locked ? (isBump ? "Barter Pitch Pack add-on" : "Pro only") : ready ? "PDF" : "Coming soon"}</p>
              </div>
              {locked ? (
                <span className="text-[12px] text-bone-3">Locked</span>
              ) : ready ? (
                <a href={`/access/${token}/download/${d.id}`} className="min-h-10 inline-flex items-center rounded-pill border border-bone-3 px-3 text-sm font-semibold">
                  Download
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>

      {!isPro && (
        <div className="mt-8 rounded-card border-2 border-lime bg-ink-2 p-5">
          <h2 className="display text-2xl">Unlock Pro for {rs(UPGRADE.price)}</h2>
          <p className="mt-2 text-sm text-bone-2">{PLANS.pro.includes.slice(1).join(", ")}. Same link, same login.</p>
          <Link href={`/checkout?upgrade=${content.ref}`} className="mt-4 flex min-h-12 w-full items-center justify-center rounded-pill bg-lime text-sm font-semibold text-ink">
            Upgrade · {rs(UPGRADE.price)}
          </Link>
        </div>
      )}

      {content.pay_in_2?.enabled && !content.pay_in_2.second_paid && (
        <div className="mt-6 rounded-card border border-coral/50 bg-ink-2 p-5">
          <p className="font-semibold">Second payment of {rs(content.pay_in_2.second)} due {new Date(content.pay_in_2.due_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}.</p>
          <Link href={`/checkout?second=${content.ref}`} className="mt-3 inline-flex min-h-11 items-center rounded-pill border border-bone-3 px-4 text-sm font-semibold">
            Pay part 2
          </Link>
        </div>
      )}

      {wa && (
        <p className="mt-10 text-sm text-bone-3">
          Stuck?{" "}
          <a href={wa} className="underline underline-offset-4">
            WhatsApp us
          </a>{" "}
          or DM @{SITE.owner.instagram}.
        </p>
      )}
    </div>
  );
}

function Invalid({ reason }: { reason?: string }) {
  const wa = whatsappLink("Hi, my access link is not working.");
  return (
    <div className="mt-8">
      <h1 className="display text-4xl">This link is not valid.</h1>
      <p className="mt-3 text-bone-2">{reason ?? "It may have been copied wrong, or the order is still being verified."}</p>
      {wa && (
        <a href={wa} className="mt-6 inline-flex min-h-12 items-center rounded-pill bg-lime px-5 text-sm font-semibold text-ink">
          WhatsApp us
        </a>
      )}
    </div>
  );
}
