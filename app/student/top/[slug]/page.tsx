import { permanentRedirect, redirect } from "next/navigation";
import { fetchTopPage } from "@/lib/api/top-page.server";
import { baseUrl } from "@/lib/site-url";
import { TopPageView } from "@/components/features/student/top/TopPageView";

/**
 * The public Top page (Docs/plans/TOP_PAGES_IMPLEMENTATION_PLAN.md §5.1).
 * Cached 60s to match the server's own Cache-Control on GET /top-pages/:slug,
 * so a god edit or the Sunday week rollover shows up within a minute.
 */
export const revalidate = 60;

export default async function TopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await fetchTopPage(slug);

  // An old slug always points at the page's current one (D5) — 308 so
  // search engines and browsers update their own records of the URL.
  if (result.status === "moved") permanentRedirect(`/top/${result.slug}`);
  // Unknown, draft or retired all land the same place (D7): 307, since the
  // destination isn't permanent — the page could come back.
  if (result.status === "not_found") redirect("/search");

  const itemListSchema = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    itemListElement: result.jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/search/${job.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema).replace(/</g, "\\u003c"),
        }}
      />
      <TopPageView page={result.page} initialJobs={result.jobs} />
    </>
  );
}
