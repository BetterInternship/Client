import { baseUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "";

  if (host.startsWith("hire.")) {
    return { rules: { userAgent: "*", disallow: ["/dashboard"] } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/applications", "/saved", "/forms"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
