"use client";

import { useEffect, useRef, useState } from "react";
import type { GuideHeading } from "@/lib/guides/content";

/** Native anchors with progressively enhanced active-section tracking. Observe
 * heading crossings in the actual scroll container, without a scroll listener.
 * Hidden below desktop; reading and navigation still work without JavaScript. */
export function GuideToc({ headings }: { headings: GuideHeading[] }) {
  const sections = headings.filter((heading) => heading.depth === 2);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const aside = asideRef.current;
    if (!aside || !window.IntersectionObserver) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    let observer: IntersectionObserver | undefined;
    function observe() {
      observer?.disconnect();
      if (!desktop.matches || !aside) return;
      let root: HTMLElement | null = aside.parentElement;
      while (root && !/(auto|scroll)/.test(getComputedStyle(root).overflowY))
        root = root.parentElement;
      const elements = headings
        .filter((heading) => heading.depth === 2)
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => element !== null);
      function update() {
        const readingLine = (root?.getBoundingClientRect().top ?? 0) + 100;
        let current = elements[0]?.id ?? "";
        for (const element of elements) {
          if (element.getBoundingClientRect().top > readingLine) break;
          current = element.id;
        }
        setActiveId(current);
      }
      observer = new IntersectionObserver(update, {
        root,
        rootMargin: "-100px 0px 0px 0px",
        threshold: 0,
      });
      // Headings alone can miss a large jump: a heading may go from below
      // the viewport to above it without ever intersecting. Observe body
      // blocks too, so entering the middle of a section also updates the TOC.
      const body = elements[0]?.parentElement;
      if (body) {
        Array.from(body.children).forEach((element) =>
          observer?.observe(element),
        );
      }
      update();
    }
    observe();
    desktop.addEventListener("change", observe);
    return () => {
      observer?.disconnect();
      desktop.removeEventListener("change", observe);
    };
  }, [headings]);

  const links = (
    <ol>
      {sections.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            onClick={() => setActiveId(heading.id)}
            aria-current={activeId === heading.id ? "location" : undefined}
            className="aria-[current=location]:text-landing-blue-hover"
          >
            {heading.title}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <aside
      ref={asideRef}
      className="sticky top-7 max-lg:hidden [&_ol]:m-0 [&_ol]:list-none [&_ol]:p-0 [&_li+li]:mt-3 [&_a]:block [&_a]:text-[13px] [&_a]:leading-[1.55] [&_a:not([aria-current])]:text-[#53637b] [&_a]:no-underline [&_a:hover]:text-landing-blue-hover [&_a:hover]:underline"
    >
      <nav
        aria-label="On this page"
        className="max-h-[calc(100dvh_-_4rem)] overflow-y-auto p-1 max-lg:hidden [&>p]:mb-3.5 [&>p]:mt-0 [&>p]:text-[13px] [&>p]:font-bold"
      >
        <p>On this page</p>
        {links}
      </nav>
    </aside>
  );
}
