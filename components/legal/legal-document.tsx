"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LegalDocument({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-neutral dark:prose-invert prose-li:m-0 prose-li:leading-[1.15] [&_li_p]:m-0 prose-p:mb-3 prose-ul:my-0 prose-ol:my-0 prose-headings:mb-1 prose-h1:mt-10 prose-h2:mt-6 prose-h3:mt-6">
        <h1 className="text-5xl">{title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BetterInternship. All rights
          reserved.
        </div>
      </div>
    </div>
  );
}
