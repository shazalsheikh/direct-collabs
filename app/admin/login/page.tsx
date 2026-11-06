import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <main className="flex flex-1 items-center">
      <div className="mx-auto w-full max-w-sm px-4 py-16">
        <p className="display text-lg">
          Direct<span className="text-lime">Collabs</span>
        </p>
        <h1 className="display mt-6 text-3xl">Admin</h1>
        <Suspense fallback={null}>
          <ErrorLine searchParams={props.searchParams} />
        </Suspense>
        <form method="post" action="/api/admin/login" className="mt-6">
          <label className="block text-sm text-bone-2">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="mt-1.5 w-full min-h-12 rounded-xl border border-ink-4 bg-ink-2 px-4 text-base text-bone focus:border-lime focus:outline-none"
            />
          </label>
          <button type="submit" className="mt-4 flex min-h-12 w-full items-center justify-center rounded-pill bg-lime text-sm font-semibold text-ink">
            Sign in
          </button>
        </form>
        {!process.env.ADMIN_PASSWORD && <p className="mt-4 text-[13px] text-coral">ADMIN_PASSWORD is not set. Add it to .env.local (8+ characters).</p>}
      </div>
    </main>
  );
}

async function ErrorLine({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const sp = await searchParams;
  if (!sp.e) return null;
  return <p className="mt-3 text-sm text-coral">Wrong password.</p>;
}
