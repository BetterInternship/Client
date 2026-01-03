/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-16 22:43:51
 * @ Modified time: 2025-12-30 22:19:57
 * @ Description:
 *
 * This kinda cool.
 */

"use client";

// Renders headers
export function HeaderRenderer({ content }: { content: string }) {
  return (
    <div className="text-lg font-bold tracking-tight text-gray-700 mt-5">
      {content}
    </div>
  );
}

// Renders paragraphs, wow descriptive!
export function ParagraphRenderer({ content }: { content: string }) {
  return <div className="py-2 font-normal text-gray-600">{content}</div>;
}
