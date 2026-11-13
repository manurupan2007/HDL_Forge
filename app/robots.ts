import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Compute and account endpoints have no crawl value.
      disallow: ["/api/", "/profile", "/verify/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
