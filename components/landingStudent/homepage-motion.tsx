"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: server-rendered content stays visible without JS.
 * Reveal offscreen sections once; never replay motion while people read them. */
export function HomepageMotion({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !window.IntersectionObserver) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = element.querySelectorAll<HTMLElement>(".home-reveal");
    const show = (section: HTMLElement) => {
      section.dataset.reveal = "visible";
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );

    for (const section of sections) {
      if (
        reducedMotion.matches ||
        section.getBoundingClientRect().top < window.innerHeight
      )
        show(section);
      else {
        section.dataset.reveal = "pending";
        observer.observe(section);
      }
    }
    // Never make keyboard users wait for an offscreen animation to finish.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const section = event.target.closest<HTMLElement>(".home-reveal");
      if (section) {
        section.dataset.revealInstant = "true";
        show(section);
        observer.unobserve(section);
      }
    };
    const onPreferenceChange = () => {
      if (!reducedMotion.matches) return;
      sections.forEach(show);
      observer.disconnect();
    };
    element.addEventListener("focusin", onFocus);
    reducedMotion.addEventListener("change", onPreferenceChange);
    return () => {
      observer.disconnect();
      element.removeEventListener("focusin", onFocus);
      reducedMotion.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
