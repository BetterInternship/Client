"use client";

import {
  useEffect,
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
        className={styles.viewport}
        tabIndex={0}
        aria-label={`${label}. Focus or hover to pause the carousel.`}
      >
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
