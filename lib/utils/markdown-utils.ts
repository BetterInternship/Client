import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";

/**
 * Convert markdown to HTML using ReactMarkdown to render.
 */
export function markdownToHtml(text: string): string {
  return renderToStaticMarkup(React.createElement(ReactMarkdown, null, text));
}

/*
 * Flatten markdown to plain text.
 */
export function markdownToPlainText(text: string): string {
  return markdownToHtml(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
