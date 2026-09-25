import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

// Parser for converting markdown to sanitized HTML.
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

/**
 * Convert markdown to HTML.
 */
export function markdownToHtml(text: string): string {
  return String(processor.processSync(text));
}

/*
 * Flattens markdown to plain text (for meta descriptions, previews, etc.)
 * by stripping tags from the rendered HTML.
 */
export function markdownToPlainText(text: string): string {
  return markdownToHtml(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
