import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/checkout", "/thank-you", "/access/", "/v/"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
