import type { MetadataRoute } from "next";
import { absoluteUrl, resolveSiteOrigin } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/review_pack.html"]
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: resolveSiteOrigin()
  };
}
