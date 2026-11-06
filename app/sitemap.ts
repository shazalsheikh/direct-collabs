import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date(SITE.legal.lastUpdated);
  return [
    { url: SITE.url, lastModified: updated, priority: 1 },
    { url: `${SITE.url}/refund-policy`, lastModified: updated, priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified: updated, priority: 0.2 },
    { url: `${SITE.url}/privacy`, lastModified: updated, priority: 0.2 },
  ];
}
