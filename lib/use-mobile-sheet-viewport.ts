"use client";

import { useLayoutEffect, useState } from "react";

/** Visible space shared by input sheets, excluding the app's navigation. */
export function useMobileSheetViewport(enabled: boolean) {
  const [viewport, setViewport] = useState<{
    top: number;
    height: number;
    bottom: number;
  }>();

  useLayoutEffect(() => {
    if (!enabled) {
      setViewport(undefined);
      return;
    }

    const update = () => {
      const visual = window.visualViewport;
      const visibleTop = visual?.offsetTop ?? 0;
      const visibleBottom = visibleTop + (visual?.height ?? window.innerHeight);
      let top = visibleTop;
      let bottom = visibleBottom;

      document
        .querySelectorAll<HTMLElement>("header, [data-mobile-bottom-nav]")
        .forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          if (element.hasAttribute("data-mobile-bottom-nav")) {
            if (rect.top < visibleBottom && rect.bottom > visibleTop) {
              bottom = Math.min(bottom, rect.top);
            }
          } else if (rect.top <= visibleTop + 1 && rect.bottom > visibleTop) {
            top = Math.max(top, rect.bottom);
          }
        });

      setViewport({
        top,
        height: Math.max(0, bottom - top),
        bottom: Math.max(0, window.innerHeight - bottom),
      });
    };

    const observer = new ResizeObserver(update);
    document
      .querySelectorAll("header, [data-mobile-bottom-nav]")
      .forEach((element) => observer.observe(element));
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return viewport;
}
