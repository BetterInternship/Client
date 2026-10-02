import type { Metadata } from "next";
import { fetchTopPage } from "@/lib/api/top-page.server";
import { topHeading } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";

/**
 * Server-side metadata for a Top page (plan D21). Falls back to `{}` on
 * anything but 'ok', as search/[job_id]/layout.tsx does — the redirect in
 * page.tsx is what actually handles moved/not_found, this only needs to not
 * crash if it's ever hit in isolation (metadata generation runs in parallel
 * with the page itself, not after its redirect).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchTopPage(slug);
  if (result.status !== "ok") return {};

  const title = topHeading(result.jobs.length, result.page.name);
  const week = currentManilaWeek();
  const companies = Array.from(
    new Set(
      result.jobs
        .map((job) => job.employer?.name)
        .filter((name): name is string => !!name),
    ),
  ).slice(0, 3);
  const description = companies.length
    ? `${week.label}. Featuring ${companies.join(", ")}${
        result.jobs.length > companies.length ? " and more" : ""
      }.`
    : week.label;
  const image = {
    url: `/top/${result.page.slug}/og?v=2`,
    width: 1200,
    height: 630,
    alt: `${title} — ${week.label}`,
  };

  return {
    title,
    description,
    alternates: { canonical: `/top/${result.page.slug}` },
    openGraph: { title, description, images: [image], type: "website" },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function TopPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
