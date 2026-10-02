"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import heroChart from "@/public/top/layers/prepared/hero-chart.webp";
import heroOpportunity from "@/public/top/layers/prepared/hero-opportunity.webp";
import discordPhone from "@/public/top/layers/prepared/discord-phone.webp";
import discordApply from "@/public/top/layers/prepared/discord-apply.webp";
import styles from "./top-artwork.module.css";

/** Decorative loops run only while their scene is visible and the tab is
 * active. Reduced motion stays static. */
function useArtworkMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const updateVisibility = () => setTabVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);
  return {
    ref,
    running: inView && tabVisible,
  };
}

/** Large, quiet ribbons from the reference, behind the supplied artwork. */
export function TopPageBackdrop() {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMin slice"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[900px] w-full"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`${id}-ribbon`}
          x1="700"
          y1="0"
          x2="700"
          y2="900"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d9edff" stopOpacity=".8" />
          <stop offset=".6" stopColor="#e6f4ff" stopOpacity=".35" />
          <stop offset="1" stopColor="#f7fbff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id}-ribbon)`} strokeWidth="115" strokeLinecap="round">
        <path d="M-170 430C-20 300 102 115 179 80" />
        <path d="M-130 650C30 467 148 235 209 237" />
        <path d="M272 598C613 408 690 85 1019-83" />
        <path d="M603 755C939 559 1040 139 1366-76" />
        <path d="M1065 828C1304 608 1362 344 1655 83" />
      </g>
    </svg>
  );
}

export function TopHeroArtwork() {
  const motion = useArtworkMotion();
  return (
    <div
      ref={motion.ref}
      className={styles.hero}
      data-artwork="hero"
      data-motion-running={motion.running}
    >
      <div className={`${styles.layer} ${styles.chart}`} aria-hidden="true">
        <Image
          src={heroChart}
          alt=""
          className="h-auto w-full"
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 330px, 72vw"
          priority
        />
      </div>
      <div
        className={`${styles.layer} ${styles.opportunity}`}
        aria-hidden="true"
      >
        <Image
          src={heroOpportunity}
          alt=""
          className="h-auto w-full"
          sizes="(min-width: 1024px) 240px, (min-width: 640px) 220px, 48vw"
          priority
        />
      </div>
      <div className={`${styles.layer} ${styles.heroApply}`} aria-hidden="true">
        <Image
          src={discordApply}
          alt=""
          className="h-auto w-full"
          sizes="(min-width: 1024px) 170px, (min-width: 640px) 156px, 34vw"
          priority
        />
      </div>
    </div>
  );
}

export function TopDiscordArtwork() {
  const motion = useArtworkMotion();
  return (
    <div
      ref={motion.ref}
      className={styles.discord}
      data-artwork="discord"
      data-motion-running={motion.running}
    >
      <div className={`${styles.layer} ${styles.phone}`} aria-hidden="true">
        <Image
          src={discordPhone}
          alt=""
          className="h-auto w-full"
          sizes="(min-width: 640px) 154px, 140px"
        />
      </div>
      <div className={`${styles.layer} ${styles.apply}`} aria-hidden="true">
        <Image
          src={discordApply}
          alt=""
          className="h-auto w-full"
          sizes="(min-width: 640px) 145px, 130px"
        />
      </div>
    </div>
  );
}
