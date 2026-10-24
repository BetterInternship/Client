"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/temp/button";
import { ArrowRight, Check, Copy } from "lucide-react";
import { usePostHog } from "@posthog/react";

/** Browser-only enhancement: the real link works without analytics or JavaScript.
 * Events include the slug/placement, never article templates or personal text. */
export function GuideSearchLink({
  slug,
  placement = "article-end",
  label = "Find internships",
}: {
  slug: string;
  placement?: string;
  label?: string;
}) {
  const posthog = usePostHog();
  return (
    <LinkButton
      href="/search"
      className="gap-3 py-3 no-underline"
      onClick={() =>
        posthog?.capture("guide_search_clicked", {
          article_slug: slug,
          placement,
        })
      }
    >
      {label}{" "}
      <ArrowRight
        size={17}
        aria-hidden="true"
        className="motion-safe:transition-transform motion-safe:group-hover/button:translate-x-[3px]"
      />
    </LinkButton>
  );
}

/** Clipboard access requires a browser and may be denied; retain manual selection
 * as the fallback. Success/failure messages are announced through role=status. */
export function CopyTemplate({ text, slug }: { text: string; slug: string }) {
  const [result, setResult] = useState<{
    text: string;
    state: "copied" | "failed";
  } | null>(null);
  const state = result?.text === text ? result.state : "idle";
  const posthog = usePostHog();
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setResult({ text, state: "copied" });
      posthog?.capture("guide_template_copied", { article_slug: slug });
    } catch {
      setResult({ text, state: "failed" });
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-landing-tint px-4 py-3 text-xs leading-normal [&_span]:text-[#53637b]">
      <Button
        variant="text"
        size="text"
        className="gap-1.5 font-[650] text-landing-blue-hover"
        onClick={() => void copy()}
      >
        {state === "copied" ? (
          <Check size={15} aria-hidden="true" />
        ) : (
          <Copy size={15} aria-hidden="true" />
        )}
        {state === "copied" ? "Copied" : "Copy template"}
      </Button>
      <span role="status">
        {state === "failed"
          ? "Copy unavailable. Select the text below to copy it."
          : state === "copied"
            ? "Template copied to clipboard."
            : "Edit the placeholders before using."}
      </span>
    </div>
  );
}
