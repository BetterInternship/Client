import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { baseUrl } from "@/lib/site-url";
import { getGuide, getGuides, guidesPreview } from "@/lib/guides/guide-content-loader";
import { GuideArticle } from "@/components/guides/guide-article";

type Props = { params: Promise<{ slug: string }> };
// Build known visible paths only; do not generate arbitrary article URLs on demand.
export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getGuides()).map(({ slug }) => ({ slug }));
}

/** Canonicals use public URLs, never /student. Preview content remains noindex. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuide((await params).slug);
  if (!guide) notFound();
  const title = `${guide.seoTitle ?? guide.title} | BetterInternship`;
  const url = `${baseUrl}/guides/${guide.slug}`;
  const description = guide.description;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots:
      guidesPreview || !guide.published
        ? { index: false, follow: false }
        : undefined,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: guide.publishedAt ?? undefined,
      modifiedTime: guide.updatedAt ?? guide.publishedAt ?? undefined,
      authors: [guide.author],
      tags: guide.tags,
      images: [{ url: `${baseUrl}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og.png`],
    },
  };
}

/** Load once through the shared loader, then pass data to presentation components.
 * Missing or hidden drafts use Next's not-found handling, not an empty article. */
export default async function GuidePage({ params }: Props) {
  const guide = await getGuide((await params).slug);
  if (!guide) notFound();
  const related = (await getGuides()).filter((item) =>
    guide.related.includes(item.slug),
  );
  return <GuideArticle guide={guide} related={related} />;
}
