import type { Metadata } from "next";
import { StudentHomepage } from "@/components/landingStudent/homepage";
import { fetchHomepageListings } from "@/components/landingStudent/homepage-listings.server";
import { getRefsData } from "@/lib/db/use-refs-backend";
import { baseUrl } from "@/lib/site-url";

// Cache the rendered homepage like the Top pages. Category-tag invalidation
// refreshes it sooner; a week is only the fallback lifetime.
export const revalidate = 604800; // TOP_PAGES_REVALIDATE_SECONDS

const title = "BetterInternship | Find internships in the Philippines";
const description =
  "Discover internships across the Philippines. Explore opportunities by field, find remote and paid internships, and apply in one click with BetterInternship.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${baseUrl}/` },
  openGraph: {
    title,
    description,
    url: `${baseUrl}/`,
    siteName: "BetterInternship",
    type: "website",
    images: [
      {
        url: `${baseUrl}/homepage/og.png`,
        width: 1200,
        height: 630,
        alt: "BetterInternship — discover internships across the Philippines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${baseUrl}/homepage/og.png`],
  },
};

export default async function HomePage() {
  const refs = await getRefsData();
  const listings = await fetchHomepageListings(refs);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "BetterInternship",
        url: `${baseUrl}/`,
        logo: `${baseUrl}/BetterInternshipLogo.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        name: "BetterInternship",
        url: `${baseUrl}/`,
        publisher: { "@id": `${baseUrl}/#organization` },
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <StudentHomepage refs={refs} listings={listings} />
    </>
  );
}
