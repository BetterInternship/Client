import { baseUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/profile",
        "/applications",
        "/saved",
        "/forms",
        "/search/og",
        "/l",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
