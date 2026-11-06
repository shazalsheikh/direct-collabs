"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";
import { track, whenIdle } from "@/lib/track";

/** Mounted once in the root layout. Persists UTMs/fbclid and fires PageView on every route. */
export function Tracking() {
  const pathname = usePathname();
  useEffect(() => {
    captureAttribution();
    whenIdle(() => track("PageView"));
  }, [pathname]);
  return null;
}

/** Drop into a page to fire one ladder event after load. */
export function TrackOnMount({ event, contentName }: { event: Parameters<typeof track>[0]; contentName?: string }) {
  useEffect(() => {
    whenIdle(() => track(event, { contentName, once: true }));
  }, [event, contentName]);
  return null;
}
