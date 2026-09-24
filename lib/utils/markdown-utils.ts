/**
 * job.description is Markdown (rendered via react-markdown — see
 * MarkdownBlock in components/shared/jobs.tsx), not HTML, so a chat preview
 * needs the syntax stripped or it shows raw `#`/`*`/`[]` markup.
 */
const stripMarkdown = (text: string): string =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export { stripMarkdown };
