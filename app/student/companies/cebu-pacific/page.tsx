"use client";

import Image from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SplitFlap, Presets } from "react-split-flap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useModalRegistry from "@/components/modals/modal-registry";
import { cn } from "@/lib/utils";
import { cebuPacificPrimaryListing, cebuPacificProfile } from "./data";
import cebuPacificLogo from "../../super-listing/cebu-pacific/logo.png";
import heroImage from "./components/4.jpg";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-paraluman-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-paraluman-mono",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-paraluman-body",
});

const TEXT_GUTTER = "px-6 sm:px-10 lg:px-16 xl:px-24";
const FEATURE_HEADING_CLASS =
  "[font-family:var(--font-paraluman-heading)] text-[clamp(1.95rem,3.6vw,3.15rem)] font-black leading-[0.96] tracking-[-0.055em]";
const BODY_COPY_CLASS =
  "[font-family:var(--font-paraluman-body)] max-w-[60ch] text-base leading-7 text-[#173957]/82 sm:text-lg sm:leading-[1.72]";
const SECTION_REVEAL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
};
const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.04 },
  },
};
const STAGGER_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};
type InViewMotionProps = {
  initial?: "hidden";
  whileInView?: "visible";
  viewport?: { once: true; amount: number };
};
const METRIC_FLIPPER_STATES = [
  { value: "20M+", label: "people served yearly" },
  { value: "60+", label: "destinations flown daily" },
  { value: "14", label: "countries served" },
];
const METRIC_FLIPPER_CHARS = [...Presets.SPECIAL, "%", "&", "/", ":"];
const METRIC_FLIPPER_LENGTH = Math.max(
  ...METRIC_FLIPPER_STATES.map((item) => item.value.length),
);
const LISTING_CARDS = [
  {
    id: "core",
    eyebrow: "Product & Web Intern",
    title: cebuPacificPrimaryListing.title,
    summary:
      "Improve the booking flow used by millions of travelers across the Philippines.",
    metrics: [
      "80% of first-time users complete a booking in <=60 seconds",
      "Reduce booking-related complaints/support tickets by 50%",
      ">=90% of users rate the booking experience as easy or very easy",
    ],
    supporting:
      "Before you start, you will complete a challenge that mirrors real product work.",
    accent: "#68b8ff",
  },
  {
    id: "digital",
    eyebrow: "Experience Track",
    title: "Digital Experience Intern",
    summary:
      "Design clearer journeys that help customers find, select, and book flights faster.",
    metrics: [
      "Increase completed search-to-book journeys from first-time users",
      "Lower friction in payment and form completion moments",
      "Ship UX improvements backed by measurable user feedback",
    ],
    supporting:
      "You will collaborate with product and engineering to ship changes with visible user impact.",
    accent: "#92cfff",
  },
  {
    id: "ops",
    eyebrow: "Operations Track",
    title: "Operations Innovation Intern",
    summary:
      "Build smarter processes that remove friction from airline operations and customer support.",
    metrics: [
      "Reduce manual operational steps in key workflows",
      "Improve turnaround speed for high-volume internal requests",
      "Launch one measurable process improvement during internship",
    ],
    supporting:
      "Your scope focuses on practical systems improvements with clear outcomes.",
    accent: "#b3dcff",
  },
] as const;

function padFlipperMetric(value: string) {
  return value.toUpperCase().padEnd(METRIC_FLIPPER_LENGTH, " ");
}

function getInViewMotionProps(
  reduceMotion: boolean,
  amount: number,
): InViewMotionProps {
  if (reduceMotion) return {};
  return {
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, amount },
  };
}

function RevealBlock({
  children,
  className,
  variants = SECTION_REVEAL_VARIANTS,
  inView,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  inView: InViewMotionProps;
}) {
  return (
    <motion.div variants={variants} {...inView} className={className}>
      {children}
    </motion.div>
  );
}

function SectionShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative border-t border-[#2574BB]/12 py-16 sm:py-20",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionInner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(TEXT_GUTTER, className)}>{children}</div>;
}

function MagneticButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const max = 6;

  const onMove = (e: React.MouseEvent) => {
    if (prefersReduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTx(x * max * 2);
    setTy(y * max * 2);
  };

  const onLeave = () => {
    setTx(0);
    setTy(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: tx, y: ty, rotate: tx * 0.3 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ListingsCTA({
  onClick,
  className,
  label = "See listings",
  size = "default",
}: {
  onClick: () => void;
  className?: string;
  label?: string;
  size?: "default" | "hero";
}) {
  return (
    <MagneticButton className={cn("w-full sm:w-auto", className)}>
      <Button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative isolate inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-[0.33em] bg-[linear-gradient(135deg,#2574BB_0%,#1b5f99_52%,#173f69_100%)] [font-family:var(--font-paraluman-heading)] font-bold uppercase tracking-[0.1em] text-white shadow-[0_16px_36px_-22px_rgba(23,63,105,0.48)] transition-all duration-300 ease-out before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_22%,#eef7ff_36%,#2574BB_50%,#6fb7ff_64%,#1c5f9b_82%,#0f4f8f_100%)] before:bg-[length:220%_100%] before:opacity-0 before:transition-opacity before:duration-300 before:ease-out before:content-[''] hover:-translate-y-0.5 hover:text-white hover:before:opacity-100 group-hover:before:[animation:runway-shine_2.2s_ease-in-out_infinite] hover:shadow-[0_22px_42px_-24px_rgba(23,63,105,0.58)] sm:w-auto",
          size === "hero"
            ? "h-14 px-8 text-base sm:h-16 sm:px-10 sm:text-lg"
            : "h-12 px-6 text-sm",
        )}
      >
        <span className="relative z-10 inline-flex items-center gap-2 text-white">
          <span className="relative z-10 text-white group-hover:text-white">
            {label}
          </span>
          <ArrowRight
            className={cn(
              "relative z-10 text-white transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-white",
              size === "hero" ? "h-5 w-5" : "h-4 w-4",
            )}
          />
        </span>
      </Button>
    </MagneticButton>
  );
}

function HeroMainContent({
  reduceMotion,
  onJumpToListings,
}: {
  reduceMotion: boolean;
  onJumpToListings: () => void;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 flex w-full max-w-3xl flex-col items-center space-y-7 text-center sm:space-y-8 lg:items-start lg:text-left"
    >
      <motion.div
        whileHover={reduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Link
          href={cebuPacificProfile.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-3 transition-all duration-300 hover:opacity-90"
        >
          <Image
            src={cebuPacificLogo}
            alt="Cebu Pacific"
            className="h-auto w-28 sm:w-36"
            priority
          />
          <span className="[font-family:var(--font-paraluman-mono)] mt-1.5 text-sm font-bold uppercase text-[#2574BB] sm:mt-2.5 sm:text-sm">
            Internships
          </span>
        </Link>
      </motion.div>

      <h1 className="[font-family:var(--font-paraluman-heading)] w-full font-black leading-[0.98]">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.64,
            delay: 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-2 block pb-[0.14em]"
        >
          <span className="block bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_24%,#badbfd_38%,#2574BB_52%,#5eaeea_66%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(2.35rem,11.5vw,4.35rem)] leading-[0.98] tracking-[-0.052em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] lg:text-7xl">
            Imagine 20 Million Travelers Using YOUR Code.
          </span>
        </motion.span>
      </h1>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{
          duration: 0.52,
          delay: 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="max-w-[57ch] [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#173957]/82 sm:text-lg sm:leading-[1.75]"
      >
        Have you ever dreamed of reaching millions of users with your code?
        Today&apos;s your lucky day. We&apos;re looking for superstar interns to
        improve our booking website.
      </motion.p>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{
          duration: 0.44,
          delay: 0.48,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex flex-col items-center gap-3 lg:items-start"
      >
        <ListingsCTA
          onClick={onJumpToListings}
          label="I want a chance"
          size="hero"
          className="mt-4"
        />
      </motion.div>
    </motion.div>
  );
}

function MetricsFlipper({ reduceMotion }: { reduceMotion: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % METRIC_FLIPPER_STATES.length);
    }, 3400);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  const metric = METRIC_FLIPPER_STATES[activeIndex] ?? METRIC_FLIPPER_STATES[0];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-2 sm:gap-6"
    >
      <div className="flex justify-center overflow-x-auto pb-1 sm:justify-end sm:pb-0">
        <div className="w-fit">
          <span className="sm:hidden">
            <SplitFlap
              value={padFlipperMetric(metric.value)}
              chars={METRIC_FLIPPER_CHARS}
              length={METRIC_FLIPPER_LENGTH}
              timing={reduceMotion ? 1 : 12}
              hinge
              theme="light"
              size="xlarge"
            />
          </span>
          <span className="hidden sm:inline-flex">
            <SplitFlap
              value={padFlipperMetric(metric.value)}
              chars={METRIC_FLIPPER_CHARS}
              length={METRIC_FLIPPER_LENGTH}
              timing={reduceMotion ? 1 : 12}
              hinge
              theme="light"
              size="xlarge"
              digitWidth={88}
              digitHeight={94}
            />
          </span>
        </div>
      </div>
      <motion.p
        key={metric.label}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="[font-family:var(--font-paraluman-heading)] whitespace-nowrap text-center text-xl font-black  tracking-[0.04em] text-[#8fceff] sm:text-left sm:text-2xl lg:text-3xl"
      >
        {metric.label}
      </motion.p>
    </motion.div>
  );
}

function MeaningfulWorkScrollScene({
  reduceMotion,
  onJumpToListings,
}: {
  reduceMotion: boolean;
  onJumpToListings: () => void;
}) {
  const getScrollParent = (node: HTMLElement | null): HTMLElement | Window => {
    let parent = node?.parentElement ?? null;
    while (parent) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      if (
        /(auto|scroll|overlay)/.test(overflowY) &&
        parent.scrollHeight > parent.clientHeight + 1
      ) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return window;
  };

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const lineOneRef = useRef<HTMLParagraphElement | null>(null);
  const lineTwoRef = useRef<HTMLParagraphElement | null>(null);
  const lineThreeRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (reduceMotion) return;
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    let lenis: Lenis | null = null;
    let lenisRaf = 0;
    let onLenisScroll: (() => void) | null = null;

    const ctx = gsap.context(() => {
      const scroller = getScrollParent(sectionRef.current);
      const scrollerElement =
        scroller === window ? null : (scroller as HTMLElement);
      const scrollerContent =
        scrollerElement?.firstElementChild as HTMLElement | null;

      if (scrollerElement && scrollerContent) {
        lenis = new Lenis({
          wrapper: scrollerElement,
          content: scrollerContent,
          duration: 1.15,
          smoothWheel: true,
          smoothTouch: false,
          wheelMultiplier: 0.92,
          touchMultiplier: 1,
          autoRaf: false,
        });

        onLenisScroll = () => ScrollTrigger.update();
        lenis.on("scroll", onLenisScroll);

        const raf = (time: number) => {
          lenis?.raf(time);
          lenisRaf = window.requestAnimationFrame(raf);
        };
        lenisRaf = window.requestAnimationFrame(raf);
      }

      const targets = [
        eyebrowRef.current,
        lineOneRef.current,
        lineTwoRef.current,
        lineThreeRef.current,
      ].filter(Boolean);

      gsap.set(targets, { autoAlpha: 0.2, y: 14 });
      if (ctaRef.current) {
        gsap.set(ctaRef.current, {
          autoAlpha: 0.2,
          y: 18,
          scale: 0.94,
          filter: "drop-shadow(0 0 0 rgba(37,116,187,0))",
        });
      }
      const fadeRange = (progress: number, start: number, end: number) => {
        if (progress <= start) return 0.2;
        if (progress >= end) return 1;
        return 0.2 + ((progress - start) / (end - start)) * 0.8;
      };
      const mapRange = (
        progress: number,
        start: number,
        end: number,
        from: number,
        to: number,
      ) => {
        if (progress <= start) return from;
        if (progress >= end) return to;
        return from + ((progress - start) / (end - start)) * (to - from);
      };
      const lineGlow = (progress: number, start: number, end: number) =>
        mapRange(progress, start, end, 0, 18);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        scroller: scroller === window ? undefined : (scroller as HTMLElement),
        start: "top top",
        end: "+=250%",
        scrub: 1.15,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (eyebrowRef.current)
            gsap.set(eyebrowRef.current, {
              autoAlpha: Math.min(0.65, fadeRange(p, 0.02, 0.24)),
              y: mapRange(p, 0.02, 0.24, 10, 0),
            });
          if (lineOneRef.current)
            gsap.set(lineOneRef.current, {
              autoAlpha: fadeRange(p, 0.1, 0.36),
              y: mapRange(p, 0.1, 0.36, 16, 0),
              textShadow: `0 0 ${lineGlow(
                p,
                0.1,
                0.36,
              )}px rgba(37,116,187,0.22)`,
            });
          if (lineTwoRef.current)
            gsap.set(lineTwoRef.current, {
              autoAlpha: fadeRange(p, 0.3, 0.62),
              y: mapRange(p, 0.3, 0.62, 16, 0),
              textShadow: `0 0 ${lineGlow(
                p,
                0.3,
                0.62,
              )}px rgba(37,116,187,0.22)`,
            });
          if (lineThreeRef.current)
            gsap.set(lineThreeRef.current, {
              autoAlpha: fadeRange(p, 0.54, 0.86),
              y: mapRange(p, 0.54, 0.86, 16, 0),
              textShadow: `0 0 ${lineGlow(
                p,
                0.54,
                0.86,
              )}px rgba(37,116,187,0.22)`,
            });
          if (ctaRef.current) {
            const ctaProgress = mapRange(p, 0.74, 1, 0, 1);
            gsap.set(ctaRef.current, {
              autoAlpha: fadeRange(p, 0.76, 0.98),
              y: mapRange(p, 0.74, 1, 18, 0),
              scale: mapRange(p, 0.74, 1, 0.94, 1),
              filter: `drop-shadow(0 0 ${mapRange(
                ctaProgress,
                0,
                1,
                0,
                14,
              )}px rgba(37,116,187,0.24))`,
            });
          }
        },
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
      if (lenisRaf) window.cancelAnimationFrame(lenisRaf);
      if (lenis && onLenisScroll) lenis.off("scroll", onLenisScroll);
      lenis?.destroy();
      ctx.revert();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center justify-center px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-none flex-col items-center text-center">
          <p
            ref={eyebrowRef}
            style={reduceMotion ? { opacity: 1 } : undefined}
            className="[font-family:var(--font-paraluman-heading)] mb-6 w-full -translate-y-7 text-[clamp(1.45rem,2.8vw,2.35rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0f2f54] sm:mb-8 sm:-translate-y-9"
          >
            Imagine an internship where...
          </p>

          <div className="w-full max-w-[1540px] space-y-3 sm:space-y-4">
            <p
              ref={lineOneRef}
              style={reduceMotion ? { opacity: 1 } : undefined}
              className="[font-family:var(--font-paraluman-heading)] mx-auto w-full text-[clamp(2rem,5.2vw,5rem)] font-black leading-[0.96] tracking-[-0.05em] text-[#0f2f54]"
            >
              You <span className="text-[#2574BB]">work</span> the way you want
            </p>
            <p
              ref={lineTwoRef}
              style={reduceMotion ? { opacity: 1 } : undefined}
              className="[font-family:var(--font-paraluman-heading)] mx-auto w-full text-[clamp(2rem,5.2vw,5rem)] font-black leading-[0.96] tracking-[-0.05em] text-[#0f2f54]"
            >
              Your <span className="text-[#2574BB]">skills</span> matter more
              than experience
            </p>
            <p
              ref={lineThreeRef}
              style={reduceMotion ? { opacity: 1 } : undefined}
              className="[font-family:var(--font-paraluman-heading)] mx-auto w-full text-[clamp(2rem,5.2vw,5rem)] font-black leading-[0.96] tracking-[-0.05em] text-[#0f2f54]"
            >
              You do work that <span className="text-[#2574BB]">matters</span>.
              <span className="block">No grunt work</span>
            </p>
          </div>

          <div
            ref={ctaRef}
            style={reduceMotion ? { opacity: 1 } : undefined}
            className="mt-8 sm:mt-10"
          >
            <ListingsCTA onClick={onJumpToListings} label="I want a chance!" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroPanel({
  reduceMotion,
  onJumpToListings,
}: {
  reduceMotion: boolean;
  onJumpToListings: () => void;
}) {
  const sharedHeroBackground =
    "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(127,192,255,0.22),transparent_24%),radial-gradient(circle_at_78%_76%,rgba(37,116,187,0.1),transparent_28%)]";
  const sharedHeroBottomFade =
    "pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(225,239,252,0.8)_100%)]";

  return (
    <section className="relative overflow-hidden">
      <div className="relative grid min-h-[100vh] bg-white lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
        <div className={sharedHeroBackground} />
        <div className={sharedHeroBottomFade} />

        <div className="relative flex min-h-[86vh] items-center justify-center overflow-hidden px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20 xl:px-24">
          <HeroMainContent
            reduceMotion={reduceMotion}
            onJumpToListings={onJumpToListings}
          />
        </div>

        <div className="relative min-h-[26rem] overflow-hidden lg:min-h-[86vh]">
          <motion.div
            initial={reduceMotion ? false : { scale: 1.05, y: 8 }}
            animate={reduceMotion ? undefined : { scale: 1, y: 0 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={heroImage}
              alt="Airplane wing above the clouds"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/52 via-[#173f69]/10 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function ListingCard({
  card,
  onSelect,
}: {
  card: (typeof LISTING_CARDS)[number];
  onSelect: () => void;
}) {
  const isPrimary = card.id === "core";

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative flex h-full min-h-[24rem] flex-col rounded-[0.33em] border border-[#2574BB]/16 p-6 text-left transition-colors duration-200 cursor-pointer sm:min-h-[27rem] sm:p-8",
        isPrimary
          ? "bg-[linear-gradient(165deg,#ffffff_0%,#f4f9ff_60%,#eaf4ff_100%)] hover:bg-[linear-gradient(165deg,#ffffff_0%,#f1f7ff_60%,#e4f1ff_100%)]"
          : "bg-[linear-gradient(165deg,#ffffff_0%,#f8fbff_60%,#edf5ff_100%)] hover:bg-[linear-gradient(165deg,#ffffff_0%,#f3f8ff_60%,#e7f2ff_100%)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-[0.33em]"
        style={{
          background: `linear-gradient(90deg, ${card.accent} 0%, rgba(37,116,187,0.22) 55%, transparent 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute right-5 top-5 h-2.5 w-2.5 rounded-full opacity-80"
        style={{ backgroundColor: card.accent }}
      />
      <div
        className="pointer-events-none absolute -right-10 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: card.accent }}
      />

      <h3 className="max-w-[15ch] [font-family:var(--font-paraluman-heading)] text-[clamp(1.9rem,2.1vw,2.6rem)] font-semibold leading-[1.07] tracking-[-0.025em] text-[#123f6b]">
        {card.title}
      </h3>

      <div className="mt-auto inline-flex items-center justify-end gap-2 pt-6 text-sm font-semibold uppercase tracking-[0.1em] text-[#4f7598] transition-colors group-hover:text-[#123f6b]">
        Open
        <ArrowRight className="-rotate-45 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}

function ListingModalContent({
  card,
}: {
  card: (typeof LISTING_CARDS)[number];
}) {
  return (
    <div className="space-y-8 p-4 text-[#123f6b] sm:space-y-10 sm:p-6">
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[#4f7598]">
          Your internship shall:
        </p>
        <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.5rem,2.35vw,2.02rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#123f6b]">
          Make Cebu Pacific the easiest airline booking experience in the
          country
        </p>
      </div>

      <div>
        <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.12em] text-[#4f7598]">
          Your internship is a success if you can:
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <p className="text-base leading-7 text-[#173957]/84">
              80% of first-time users complete a flight booking in less than 60
              seconds without assistance
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <p className="text-base leading-7 text-[#173957]/84">
              Reduce booking-related complaints/support tickets by 50%
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <p className="text-base leading-7 text-[#173957]/84">
              Achieve greater than 90% of users rating booking experience as
              "easy" or "very easy"
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[0.33em] bg-[#edf4fc] p-5 sm:p-6">
        <p className="text-base leading-7 text-[#173957]/76">
          Exciting? But before you can start the internship, you shall pass our
          challenge.
        </p>
      </div>

      <div className="pt-3 sm:pt-4">
        <Button asChild className="h-12 w-full rounded-[0.33em]">
          <Link
            href="/super-listing/cebu-pacific"
            className="flex items-center justify-center gap-2"
          >
            Apply now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
export default function CebuPacificCompanyProfilePage() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRevealMotion = getInViewMotionProps(shouldReduceMotion, 0.24);
  const sectionStaggerMotion = getInViewMotionProps(shouldReduceMotion, 0.18);
  const modalRegistry = useModalRegistry();
  const listingsRef = useRef<HTMLParagraphElement | null>(null);

  const scrollToListings = () => {
    listingsRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <main
      className={cn(
        "relative isolate min-h-screen bg-[#f8fafe] text-black",
        "[&_*]:selection:bg-[#173f69]/20 [&_*]:selection:text-[#123f6b]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_12%,rgba(37,116,187,0.12),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(37,116,187,0.1),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(37,116,187,0.07),transparent_44%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-18" />

      <section className="relative">
        <HeroPanel
          reduceMotion={shouldReduceMotion}
          onJumpToListings={scrollToListings}
        />
      </section>
      <style jsx global>{`
        @keyframes runway-shine {
          0% {
            background-position: 180% 50%;
          }
          100% {
            background-position: -40% 50%;
          }
        }
      `}</style>

      <section>
        <SectionShell className="border-t-0 bg-[#173f69] py-12 sm:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(143,206,255,0.16),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(255,255,255,0.07),transparent_30%),linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:auto,auto,28px_28px,28px_28px] opacity-40" />
          <SectionInner>
            <RevealBlock
              inView={sectionRevealMotion}
              className="mx-auto w-full max-w-5xl"
            >
              <MetricsFlipper reduceMotion={shouldReduceMotion} />
            </RevealBlock>
          </SectionInner>
        </SectionShell>

        <SectionShell className="border-t-0 bg-[#f4f8fc] py-0">
          <MeaningfulWorkScrollScene
            reduceMotion={shouldReduceMotion}
            onJumpToListings={scrollToListings}
          />
        </SectionShell>

        <SectionShell className="relative -mt-8 overflow-hidden border-t-0 bg-[linear-gradient(180deg,#edf4fc_0%,#e5effa_44%,#dbe9f8_100%)] py-10 sm:-mt-12 sm:py-12 min-h-[100svh]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#f4f8fc] via-[#eef4fc] to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(127,192,255,0.16),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(23,63,105,0.09),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-80 [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_22%,rgba(0,0,0,0.35)_38%,rgba(0,0,0,0.8)_55%,#000_66%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_22%,rgba(0,0,0,0.35)_38%,rgba(0,0,0,0.8)_55%,#000_66%)] bg-[linear-gradient(to_right,rgba(23,63,105,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,63,105,0.03)_1px,transparent_1px)] bg-[size:44px_44px,44px_44px]" />
          <SectionInner className="relative flex min-h-[calc(100svh-5.25rem)] w-full flex-col justify-between gap-10 sm:min-h-[calc(100svh-6rem)]">
            <RevealBlock
              inView={sectionRevealMotion}
              className="pt-8 text-center sm:pt-10"
            >
              <p
                ref={listingsRef}
                className="[font-family:var(--font-paraluman-heading)] bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_24%,#badbfd_38%,#2574BB_52%,#5eaeea_66%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(2.6rem,5.7vw,5.1rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite]"
              >
                Better internships start here.
              </p>
            </RevealBlock>
            <RevealBlock
              variants={STAGGER_CONTAINER_VARIANTS}
              inView={sectionStaggerMotion}
              className="pb-2 sm:pb-4"
            >
              <div className="mx-auto grid w-full max-w-6xl gap-3 md:grid-cols-2 lg:grid-cols-3">
                {LISTING_CARDS.map((card, index) => (
                  <motion.div
                    key={card.id}
                    variants={STAGGER_ITEM_VARIANTS}
                    initial={
                      shouldReduceMotion ? undefined : { opacity: 0, y: 8 }
                    }
                    animate={
                      shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: index * 0.08,
                    }}
                    className="-m-px"
                  >
                    <ListingCard
                      card={card}
                      onSelect={() => {
                        modalRegistry.centeredDetails.open({
                          title: (
                            <span className="[font-family:var(--font-paraluman-heading)] text-2xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#123f6b] sm:text-[2.05rem]">
                              {card.title}
                            </span>
                          ),
                          content: <ListingModalContent card={card} />,
                          showHeaderDivider: false,
                          closeOnBackdropClick: true,
                          closeOnEscapeKey: true,
                          showCloseButton: true,
                        });
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </RevealBlock>
          </SectionInner>
        </SectionShell>

        <SectionShell className="border-t-0 bg-[#f4f9ff] py-16 sm:py-20">
          <SectionInner className="space-y-8">
            <RevealBlock
              inView={sectionRevealMotion}
              className="mx-auto max-w-4xl text-center"
            >
              <p className="[font-family:var(--font-paraluman-heading)] mt-2 text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-[#123f6b]">
                Questions you might have
              </p>
            </RevealBlock>

            <RevealBlock
              inView={sectionRevealMotion}
              className="mx-auto max-w-4xl"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-0" className="border-[#2574BB]/12">
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#173f69] hover:no-underline sm:text-lg">
                    Do I need a resume to apply?
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-70 sm:text-base">
                    No. Cebu Pacific reviews your challenge output first. Your
                    thinking, execution, and decision quality matter most.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-1" className="border-[#2574BB]/12">
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#173f69] hover:no-underline sm:text-lg">
                    How fast will I hear back?
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-70 sm:text-base">
                    Our target is to respond within 24 hours so strong
                    applicants can move forward quickly.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2" className="border-[#2574BB]/12">
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#173f69] hover:no-underline sm:text-lg">
                    What kind of work will interns do?
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-70 sm:text-base">
                    Real product work. You&apos;ll help improve the booking
                    experience used by millions of Filipino travelers.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3" className="border-[#2574BB]/12">
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#173f69] hover:no-underline sm:text-lg">
                    Which listings should I apply to?
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-70 sm:text-base">
                    Choose the role where your skills are strongest, then submit
                    a high-quality challenge response for that listing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </RevealBlock>
          </SectionInner>
        </SectionShell>
      </section>
    </main>
  );
}
