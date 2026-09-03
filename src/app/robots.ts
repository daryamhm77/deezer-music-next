import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/search", "/login", "/signup"],
      disallow: ["/api/", "/onboarding", "/playlists", "/favorites/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
