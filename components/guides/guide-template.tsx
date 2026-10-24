"use client";

import { useId, useState } from "react";
import { CopyTemplate } from "./guide-actions";

/** Editable plain-text template. The textarea is rendered in server HTML and
 * remains manually editable/selectable without JavaScript. Copy uses the
 * current edits, never the original placeholders. Edits are not saved remotely. */
export function GuideTemplate({ text, slug }: { text: string; slug: string }) {
  const [value, setValue] = useState(text.trimEnd());
  const id = useId();
  return (
    <section
      className="not-prose my-7 overflow-hidden rounded-xl border border-landing-control bg-white"
      aria-label="Editable template"
    >
      <label htmlFor={id} className="sr-only">
        Editable template
      </label>
      <CopyTemplate text={value} slug={slug} />
      <textarea
        id={id}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={Math.min(24, Math.max(8, text.split("\n").length))}
        spellCheck
        className="block w-full resize-y border-0 bg-white p-5 text-sm leading-[1.8] text-landing-nav shadow-none focus:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-landing-blue"
      />
    </section>
  );
}
