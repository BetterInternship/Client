import type { Metadata } from "next";
import { StudentHomepage } from "@/components/landingStudent/homepage";
import { getRefsData } from "@/lib/db/use-refs-backend";
import { baseUrl } from "@/lib/site-url";
import { UserService } from "@/lib/api/services";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const title = "Find Internships in the Philippines | BetterInternship";
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
        url: `${baseUrl}/og.png`,
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
    images: [`${baseUrl}/og.png`],
  },
};

async function isLoggedIn() {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return false;

  try {
    const response = await UserService.getMyProfile({
      cache: "no-store",
      headers: {
        cookie: cookieHeader,
      },
    });

    return !!response.user;
  } catch {
    return false;
  }
}

export default async function HomePage() {
  if (await isLoggedIn()) {
    redirect("/search");
  }

  const refs = await getRefsData();
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
      <StudentHomepage refs={refs} />
    </>
  );
}
