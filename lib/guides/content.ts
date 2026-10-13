/**
 * Pure content rules shared by the loader and Markdown renderer. No filesystem,
 * database, or browser state here. Keep heading generation in one place so the
 * TOC and rendered IDs cannot drift apart.
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.iso.date();
const guideSchema = z
  .object({
    slug,
    title: z.string().trim().min(1),
    seoTitle: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1),
    category: z.string().trim().min(1),
    tags: z.array(z.string().trim().min(1)).default([]),
    order: z.number().int().nonnegative().default(0),
    image: z
      .string()
      .regex(/^\/(?!\/).+\.(?:webp|png|jpg)$/)
      .optional(),
    archived: z.boolean().default(false),
    nextStep: z.string().trim().min(1).optional(),
    ctaTitle: z.string().trim().min(1).optional(),
    ctaLabel: z.string().trim().min(1).optional(),
    takeaway: z.string().trim().min(1),
    author: z.literal("BetterInternship Team").default("BetterInternship Team"),
    status: z.enum(["draft", "published"]),
    publishedAt: date.nullable(),
    updatedAt: date.nullable(),
    related: z.array(slug),
    faqs: z
      .array(
        z.object({
          question: z.string().trim().min(1),
          answer: z.string().trim().min(1),
        }),
      )
      .default([]),
  })
  .superRefine((guide, ctx) => {
    if (guide.status === "published" && !guide.publishedAt)
      ctx.addIssue({
        code: "custom",
        message: "Published guides need a publication date",
      });
    if (
      guide.updatedAt &&
      (!guide.publishedAt || guide.updatedAt < guide.publishedAt)
    )
      ctx.addIssue({
        code: "custom",
        message: "Update date must not precede publication",
      });
  });

export type GuideMeta = z.infer<typeof guideSchema>;
export type GuideHeading = { id: string; title: string; depth: number };
// A small structural AST type keeps both TOC generation and the remark plugin
// on the same parser, without regex-parsing Markdown or counting React renders.
type MarkdownNode = {
  type: string;
  depth?: number;
  value?: string;
  alt?: string | null;
  url?: string;
  children?: MarkdownNode[];
  data?: { hProperties?: Record<string, unknown> };
};

/** Validate the collected frontmatter; "manifest" is an in-memory list, not a file. */
export function validateManifest(input: unknown): GuideMeta[] {
  const guides = z.array(guideSchema).parse(input);
  const slugs = new Set(guides.map((guide) => guide.slug));
  if (slugs.size !== guides.length) throw new Error("Duplicate guide slug");
  for (const guide of guides) {
    for (const related of guide.related) {
      if (!slugs.has(related) || related === guide.slug)
        throw new Error(`Invalid related guide: ${guide.slug} → ${related}`);
    }
  }
  return guides;
}

/** UTC date eligibility at render/build time; this does not schedule a deployment. */
export function isPublished(
  guide: GuideMeta,
  today = new Date().toISOString().slice(0, 10),
) {
  return (
    guide.status === "published" &&
    !!guide.publishedAt &&
    guide.publishedAt <= today
  );
}

function text(node: MarkdownNode): string {
  return node.value ?? node.alt ?? node.children?.map(text).join("") ?? "";
}

/** Assign stable, unique anchors to actual parsed headings, not fenced-code text. */
export function assignGuideHeadings(tree: MarkdownNode): GuideHeading[] {
  const headings: GuideHeading[] = [];
  const used = new Set<string>();
  function visit(node: MarkdownNode) {
    if (node.type === "heading") {
      if (node.depth === 1)
        throw new Error("Use H2/H3 in guide bodies; the template supplies H1");
      const title = text(node);
      const base =
        title
          .normalize("NFKD")
          .toLowerCase()
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "section";
      let id = `guide-${base}`;
      let suffix = 2;
      while (used.has(id)) id = `guide-${base}-${suffix++}`;
      used.add(id);
      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, id },
      };
      headings.push({ id, title, depth: node.depth ?? 2 });
    }
    node.children?.forEach(visit);
  }
  visit(tree);
  return headings;
}

/** Renderer plugin using exactly the same IDs as analyzeGuide's table of contents. */
export function remarkGuideHeadings() {
  return (tree: MarkdownNode) => {
    assignGuideHeadings(tree);
  };
}

/** Reject unsupported bodies and derive TOC, links, and an estimated reading time. */
export function analyzeGuide(body: string, additionalText = "") {
  if (!body.trim()) throw new Error("Guide body is empty");
  const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
  const headings = assignGuideHeadings(tree);
  if (!headings.length) throw new Error("Guide needs section headings");
  const links: string[] = [];
  const words: string[] = [];
  function visit(node: MarkdownNode) {
    if ((node.type === "link" || node.type === "definition") && node.url)
      links.push(node.url);
    if (node.type === "html")
      throw new Error("Raw HTML is not supported in guides");
    if (node.value) words.push(node.value);
    node.children?.forEach(visit);
  }
  visit(tree);
  // FAQ answers live in frontmatter but still count toward reading time.
  if (additionalText) words.push(additionalText);
  return {
    headings,
    links,
    readingMinutes: Math.max(
      1,
      Math.ceil(words.join(" ").split(/\s+/).length / 220),
    ),
  };
}
