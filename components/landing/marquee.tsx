"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { cn } from "@betterinternship/components";
import styles from "./marquee.module.css";

export type MarqueeProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  duration?: number;
};

export function Marquee({
  label,
  duration = 130,
  children,
  className,
  style,
  ...props
}: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const instructionsId = useId();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    const element = viewport.current;
    const group = element?.querySelector<HTMLElement>(`.${styles.group}`);
    if (!element || !group) return;

    const mobile = window.matchMedia("(max-width: 767px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let previousTime = 0;
    let position = element.scrollLeft;
    let interacting = false;
    let pausedUntil = 0;

    const animate = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;
      if (interacting || time < pausedUntil) {
        position = element.scrollLeft;
      } else {
        const groupWidth = group.getBoundingClientRect().width;
        if (groupWidth > 0) {
          position =
            (position + (elapsed * groupWidth) / (duration * 1000)) %
            groupWidth;
          element.scrollLeft = position;
        }
      }
      frameId = requestAnimationFrame(animate);
    };

    const update = () => {
      cancelAnimationFrame(frameId);
      previousTime = 0;
      if (!mobile.matches) element.scrollLeft = 0;
      position = element.scrollLeft;
      if (mobile.matches && !reducedMotion.matches && visible && duration > 0) {
        frameId = requestAnimationFrame(animate);
      }
    };
    const pause = () => {
      pausedUntil = performance.now() + 2500;
    };
    const startInteraction = () => {
      interacting = true;
      pause();
    };
    const endInteraction = () => {
      interacting = false;
      pause();
    };

    element.addEventListener("pointerdown", startInteraction);
    window.addEventListener("pointerup", endInteraction);
    window.addEventListener("pointercancel", endInteraction);
    element.addEventListener("wheel", pause, { passive: true });
    element.addEventListener("keydown", pause);
    mobile.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    update();

    return () => {
      cancelAnimationFrame(frameId);
      element.removeEventListener("pointerdown", startInteraction);
      window.removeEventListener("pointerup", endInteraction);
      window.removeEventListener("pointercancel", endInteraction);
      element.removeEventListener("wheel", pause);
      element.removeEventListener("keydown", pause);
      mobile.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, [duration, visible]);

  return (
    <div
      ref={root}
      className={cn(styles.marquee, className)}
      style={
        { "--marquee-duration": `${duration}s`, ...style } as CSSProperties
      }
      role="region"
      aria-label={label}
      aria-roledescription="carousel"
      data-paused={!visible}
      {...props}
    >
      <div
        ref={viewport}
        className={styles.viewport}
        tabIndex={0}
        aria-label={label}
        aria-describedby={instructionsId}
      >
        <span id={instructionsId} className="sr-only">
          <span className="md:hidden">
            Swipe or use the arrow keys to pause scrolling and read more.
          </span>
          <span className="max-md:hidden">
            Focus or hover to pause the carousel.
          </span>
        </span>
        <div className={styles.track}>
          <div className={styles.group}>{children}</div>
          <div className={styles.group} aria-hidden="true" inert>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
