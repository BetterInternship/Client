/**
 * Reads deployed Markdown into validated article data. This module does NOT
 * start a server or expose an API; only Next.js build/server code may import it.
 * Generated pages normally come from the deployment cache, not a fresh file
 * read per visitor. The student layout can still trigger periodic revalidation.
 * Authoring and publishing instructions: app/student/guides/_content/README.md.
 */
import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { parse } from "yaml";
import { cache } from "react";
import { analyzeGuide, isPublished, validateManifest } from "./content";

/** Local drafts are visible; public Vercel production never enables preview. */
export const guidesPreview =
  process.env.VERCEL_ENV !== "production" &&
  (process.env.NODE_ENV === "development" ||
    process.env.GUIDES_PREVIEW === "true");

// Discover trusted files first; request slugs never become file paths.
// React cache deduplicates work within a server render, not permanently across
// processes. Fresh renders can pick up local edits during development.
const loadGuides = cache(async () => {
  const directory = path.join(
    process.cwd(),
    "app",
    "student",
    "guides",
    "_content",
  );
  // Lowercase article names only: README.md is documentation, not an article.
  const files = (await readdir(directory)).filter((file) =>
    /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(file),
  );
  const documents = await Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(
        await readFile(path.join(directory, file), "utf8"),
        {
          // Use the maintained YAML parser explicitly: the project's js-yaml
          // override is incompatible with gray-matter's default safeLoad call.
          engines: {
            yaml: (source: string) => parse(source) as Record<string, unknown>,
          },
        },
      );
      // Filename wins over any frontmatter slug, keeping one URL source of truth.
      return { metadata: { ...data, slug: file.slice(0, -3) }, body: content };
    }),
  );
  const metadata = validateManifest(
    documents.map((document) => document.metadata),
  );
  const guides = metadata.map((meta, index) => ({
    ...meta,
    body: documents[index].body,
    ...analyzeGuide(
      documents[index].body,
      meta.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(" "),
    ),
    published: isPublished(meta),
  }));
  // Fail early for broken guide links, including cross-article heading anchors.
  // Related cards can omit drafts; a published body must not link to a draft.
  for (const guide of guides) {
    for (const href of guide.links) {
      if (!href.startsWith("/guides/") && !href.startsWith("#")) continue;
      const [slug, anchor] = href.startsWith("#")
        ? [guide.slug, href.slice(1)]
        : href.slice(8).split("#");
      const target = guides.find((item) => item.slug === slug);
      if (
        !target ||
        (!guide.archived &&
          (target.archived || (guide.published && !target.published)))
      )
        throw new Error(`Unavailable guide link in ${guide.slug}: ${href}`);
      if (anchor && !target.headings.some((heading) => heading.id === anchor))
        throw new Error(`Unknown guide anchor: ${href}`);
    }
  }
  return guides.sort(
    (a, b) => a.order - b.order || a.slug.localeCompare(b.slug),
  );
});

/** Sitemap input: never includes drafts, even when local preview is enabled. */
export const getPublishedGuideMetadata = async () =>
  (await loadGuides()).filter((guide) => guide.published && !guide.archived);
/** Library, related cards, and generateStaticParams share this visibility rule. */
export const getGuides = cache(async () =>
  (await loadGuides()).filter(
    (guide) => !guide.archived && (guidesPreview || guide.published),
  ),
);
/** Resolve against visible content only; null lets the route call notFound(). */
export const getGuide = cache(
  async (slug: string) =>
    (await getGuides()).find((guide) => guide.slug === slug) ?? null,
);
export type Guide = NonNullable<Awaited<ReturnType<typeof getGuide>>>;
