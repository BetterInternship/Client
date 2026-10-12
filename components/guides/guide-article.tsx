import Link from "next/link";
import { landingContainerClassName } from "@/components/landing/layout";
import { ArrowRight, ChevronRight } from "lucide-react";
import { baseUrl } from "@/lib/site-url";
import type { Guide } from "@/lib/guides/guide-content-loader";
import { GuideBody } from "@/components/guides/guide-body";
import { GuideToc } from "@/components/guides/guide-toc";
import { GuideSearchLink } from "@/components/guides/guide-actions";
import { Card } from "@/components/ui/temp/card";
import { SectionHeading } from "@/components/ui/temp/section-heading";

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Server-rendered article presentation and matching JSON-LD. Data filtering and
 * SEO metadata belong to the route/loader; this component never fetches articles. */
export function GuideArticle({
  guide,
  related,
}: {
  guide: Guide;
  related: Guide[];
}) {
  const url = `${baseUrl}/guides/${guide.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        mainEntityOfPage: url,
        url,
        image: `${baseUrl}/og.png`,
        inLanguage: "en-PH",
        author: { "@type": "Organization", name: guide.author, url: baseUrl },
        publisher: {
          "@type": "Organization",
          name: "BetterInternship",
          url: baseUrl,
        },
        ...(guide.publishedAt
          ? {
              datePublished: guide.publishedAt,
              dateModified: guide.updatedAt ?? guide.publishedAt,
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: `${baseUrl}/guides`,
          },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
    ],
  };
  return (
    <main id="guides-main" tabIndex={-1} className={landingContainerClassName}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <nav
        aria-label="Breadcrumb"
        className="my-8 flex flex-wrap items-center gap-2 text-xs text-landing-muted max-md:hidden"
      >
        <Link href="/" className="hover:text-landing-blue">
          Home
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <Link href="/guides" className="hover:text-landing-blue">
          Guides
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page">{guide.title}</span>
      </nav>
      <article>
        <header className="mx-auto max-w-225 pb-10.5 pt-4.5 text-center max-md:pb-7 max-md:pt-1 [&_h1]:m-0 [&_h1]:text-balance [&_h1]:text-[clamp(32px,4vw,52px)] [&_h1]:font-[750] [&_h1]:leading-[1.1] [&_h1]:tracking-[-.04em]">
          <h1>{guide.title}</h1>
          <p className="mx-auto my-5.5 max-w-[68ch] text-lg leading-[1.7] text-[#4a5870] max-md:text-base">
            {guide.description}
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#53637b]">
            <span>By {guide.author}</span>
            <span>{guide.readingMinutes} min read</span>
            {guide.publishedAt && (
              <span>
                {guide.updatedAt && guide.updatedAt !== guide.publishedAt
                  ? "Updated "
                  : "Published "}
                <time dateTime={guide.updatedAt ?? guide.publishedAt}>
                  {displayDate(guide.updatedAt ?? guide.publishedAt)}
                </time>
              </span>
            )}
          </div>
        </header>
        <Card
          variant="surface"
          className="grid grid-cols-[220px_minmax(0,740px)] items-start gap-10 rounded-2xl p-8 max-lg:grid-cols-1 max-lg:gap-6 max-md:border-0 max-md:p-0"
        >
          <GuideToc headings={guide.headings} />
          <div className="min-w-0 max-lg:mx-auto max-lg:w-full max-lg:max-w-185">
            <GuideBody body={guide.body} slug={guide.slug} faqs={guide.faqs} />
            <section className="mt-12 rounded-xl bg-landing-tint p-7 max-md:p-6 [&_h2]:mb-2.5 [&_h2]:mt-0 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-[-.025em] [&_p]:m-0 [&_p]:leading-[1.7] [&_p]:text-[#4a5870] [&_a]:mt-5">
              <h2>{guide.ctaTitle ?? "Your next step"}</h2>
              <p>
                {guide.nextStep ??
                  "Use what you’ve learned to build your internship shortlist."}
              </p>
              <GuideSearchLink slug={guide.slug} label={guide.ctaLabel} />
            </section>
          </div>
        </Card>
      </article>
      {related.length > 0 && (
        <section
          className="my-18 pt-8 max-md:my-11 [&>h2]:mb-6 [&>h2]:mt-0 [&>h2]:text-[28px] [&>h2]:font-bold [&>h2]:tracking-[-.03em] [&>div]:grid [&>div]:grid-cols-2 [&>div]:gap-10 max-md:[&>div]:grid-cols-1 max-md:[&>div]:gap-7 [&_a]:text-inherit [&_a]:no-underline [&_a>span]:flex [&_a>span]:items-center [&_a>span]:gap-3 [&_a>span]:text-xs [&_a>span]:text-[#53637b] [&_h3]:mb-5 [&_h3]:mt-3 [&_h3]:text-[22px] [&_h3]:font-[650] [&_h3]:leading-[1.3] [&_h3]:tracking-[-.025em] [&_a:hover_h3]:text-landing-blue-hover"
          aria-labelledby="related-guides-heading"
        >
          <header>
            <SectionHeading title="Keep going" id="related-guides-heading" />
          </header>
          <div>
            {related.map((item) => (
              <Link key={item.slug} href={`/guides/${item.slug}`}>
                <h3>{item.title}</h3>
                <span>
                  {item.readingMinutes} min read{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
