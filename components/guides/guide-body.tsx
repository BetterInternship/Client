import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkGuideHeadings } from "@/lib/guides/content";
import { GuideTemplate } from "./guide-template";
import { FaqList } from "@/components/landing/faq-list";
import type { GuideMeta } from "@/lib/guides/content";
import { ResumeDownload } from "./resume-download";

/** Render trusted plain Markdown on the server. GFM supplies tables/lists;
 * Tailwind Typography supplies reading styles. Raw HTML is never executed.
 * Only copy buttons hydrate; template text remains selectable without JS. */
export function GuideBody({
  body,
  slug,
  faqs,
}: {
  body: string;
  slug: string;
  faqs: GuideMeta["faqs"];
}) {
  return (
    <div className="prose max-w-[65ch] text-[17px] leading-[1.75] text-[#303e53] [overflow-wrap:anywhere] max-md:text-base prose-headings:scroll-mt-7 prose-headings:text-landing-navy prose-headings:tracking-tight prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-[28px] max-md:prose-h2:text-[25px] prose-h3:mb-3 prose-h3:mt-7 prose-h3:text-[21px] prose-p:my-4 prose-p:text-[length:inherit] prose-p:leading-[1.75] prose-p:text-inherit prose-li:my-2 prose-li:text-[length:inherit] prose-li:leading-[1.75] prose-ul:my-4 prose-ol:my-4 prose-a:text-landing-blue-hover prose-a:underline-offset-3 prose-strong:text-[#182d4c] prose-blockquote:rounded-r-lg prose-blockquote:border-landing-blue prose-blockquote:bg-landing-tint prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:font-normal prose-blockquote:not-italic prose-p:before:content-none prose-p:after:content-none prose-table:min-w-135 prose-table:text-sm prose-th:bg-[#f4f7fc] prose-th:p-3 prose-td:p-3 [&>:first-child]:mt-0">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm, remarkGuideHeadings]}
        components={{
          // The Markdown heading keeps its TOC anchor; answers use the same
          // accessible accordion as the homepage, outside Typography styling.
          h2: ({ node: _node, children, ...props }) => (
            <>
              <h2 {...props}>{children}</h2>
              {slug === "internship-resume-no-experience" &&
                props.id === "guide-see-an-example-resume" && (
                  <ResumeDownload />
                )}
              {props.id === "guide-questions-you-might-still-have" &&
                faqs.length > 0 && (
                  <FaqList items={faqs} className="not-prose my-6" />
                )}
            </>
          ),
          table: ({ children }) => (
            <div
              className="my-7 overflow-x-auto rounded-lg border border-landing-border focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-landing-blue"
              role="region"
              aria-label="Guide reference table"
              tabIndex={0}
            >
              <table>{children}</table>
            </div>
          ),
          pre: ({ children, node }) => {
            const code = node?.children.find(
              (child) => child.type === "element" && child.tagName === "code",
            );
            const value =
              code?.type === "element"
                ? code.children
                    .map((child) => (child.type === "text" ? child.value : ""))
                    .join("")
                : "";
            return value ? (
              <GuideTemplate text={value} slug={slug} />
            ) : (
              <pre>{children}</pre>
            );
          },
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
