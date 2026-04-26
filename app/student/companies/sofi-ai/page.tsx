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
import { ArrowRight, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useModalRegistry from "@/components/modals/modal-registry";
import { cn } from "@/lib/utils";
import { sofiAiPrimaryListing, sofiAiProfile } from "./data";

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
  "[font-family:var(--font-paraluman-body)] max-w-[60ch] text-base leading-7 text-[#184d45]/82 sm:text-lg sm:leading-[1.72]";
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
const SOFI_AI_LOGO_URL =
  "https://sofitech.ai/_next/static/media/sofi-ai-chat-support-automation-logo-vector.80ec9e4e.png";
const SOFI_AI_HERO_VIDEO_URL =
  "https://www.sofitech.ai/videos/landscape_english_wcaption.mp4";
const FOUNDER_PROFILE = {
  name: "Sophia Nicole Sy",
  role: "Founder of Sofi AI\nYoung Filipino builder leading a real, revenue-generating AI startup focused on practical execution.",
  profileUrl: "https://www.linkedin.com/in/sophia-nicole-sy/",
  image:
    "https://media.licdn.com/dms/image/v2/D5603AQHOdvGO-2aSBg/profile-displayphoto-shrink_400_400/B56ZW3MvE4GoAk-/0/1742535326021?e=1778716800&v=beta&t=alkNMb4zoeKaxYFqFDC2jwRqMM2zFwmRF2SLl0oIPpw",
};
const LISTING_CARDS = [
  {
    id: "core",
    title: sofiAiPrimaryListing.title,
    summary:
      "Build practical frontend experiences for Sofi AI, starting with a TikTok hook-analysis product interface",
    metrics: [
      "Support link, caption, script, and hook-text inputs",
      "Show scores, retention risk, clarity, niche fit, and rewrites",
      "Deliver a product-ready flow with loading, empty, failed, and comparison states",
    ],
    supporting:
      "Before internship onboarding, you complete a challenge that mirrors the kind of applied AI product work Sofi AI ships.",
    accent: "#07C4A7",
  },
  {
    id: "digital",
    eyebrow: "Product Track",
    title: "AI Product Operations Intern",
    summary:
      "Support product testing, customer automation workflows, and operating systems for a fast-growing applied AI team.",
    metrics: [
      "Clarify one customer-facing workflow",
      "Improve a repetitive AI-assisted process",
      "Ship one measurable product or operations improvement",
    ],
    supporting:
      "You will work close to real product and customer workflows, not simulated tasks.",
    accent: "#35e3ca",
  },
  {
    id: "ops",
    eyebrow: "Growth Track",
    title: "Startup Growth Intern",
    summary:
      "Help translate Sofi AI's founder-led momentum, product wins, and customer outcomes into clearer growth systems.",
    metrics: [
      "Map one growth or onboarding funnel",
      "Improve customer-facing messaging clarity",
      "Produce one implementation-ready growth experiment",
    ],
    supporting:
      "Your scope focuses on practical outputs that help the team move faster.",
    accent: "#8cf5e4",
  },
] as const;

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
        "relative border-t border-[#07C4A7]/12 py-16 sm:py-20",
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
          "group relative isolate inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-[0.33em] bg-[linear-gradient(135deg,#07C4A7_0%,#0D3B33_52%,#0D3B33_100%)] [font-family:var(--font-paraluman-heading)] font-bold uppercase tracking-[0.1em] text-white shadow-[0_16px_36px_-22px_rgba(13,59,51,0.48)] transition-all duration-300 ease-out before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(110deg,#0D3B33_0%,#07C4A7_22%,#e9fffb_36%,#07C4A7_50%,#35e3ca_64%,#0D3B33_82%,#0D3B33_100%)] before:bg-[length:220%_100%] before:opacity-0 before:transition-opacity before:duration-300 before:ease-out before:content-[''] hover:-translate-y-0.5 hover:text-white hover:before:opacity-100 group-hover:before:[animation:runway-shine_2.2s_ease-in-out_infinite] hover:shadow-[0_22px_42px_-24px_rgba(13,59,51,0.58)] sm:w-auto",
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
      className="relative z-10 flex w-full max-w-4xl flex-col items-center space-y-5 text-center sm:space-y-6"
    >
      <motion.div
        whileHover={reduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <Link
          href={sofiAiProfile.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-3 transition-all duration-300 hover:opacity-90"
        >
          <Image
            src={SOFI_AI_LOGO_URL}
            alt="Sofi AI logo"
            width={160}
            height={48}
            className="h-auto w-16 grayscale brightness-0 contrast-150 sm:w-20"
            priority
          />
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
          <span className="block bg-[linear-gradient(110deg,#0D3B33_0%,#07C4A7_24%,#bcfff2_38%,#07C4A7_52%,#35e3ca_66%,#0D3B33_82%,#0D3B33_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(2.35rem,11.5vw,4.35rem)] leading-[0.98] tracking-[-0.052em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] lg:text-7xl">
            Build the AI Workflows Companies Will Run On.
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
        className="max-w-[57ch] text-center [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#184d45]/82 sm:text-lg sm:leading-[1.75]"
      >
        You’ll work on real projects with real clients,  helping build and ship
        things that people actually use.
      </motion.p>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{
          duration: 0.52,
          delay: 0.44,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex flex-col items-center gap-3"
      >
        <ListingsCTA
          onClick={onJumpToListings}
          label="I want a chance"
          size="hero"
        />
      </motion.div>
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

    const ctx = gsap.context(() => {
      const scroller = getScrollParent(sectionRef.current);
      const triggerScroller =
        scroller === window ? undefined : (scroller as HTMLElement);

      const targets = [
        eyebrowRef.current,
        lineOneRef.current,
        lineTwoRef.current,
        lineThreeRef.current,
      ].filter(Boolean);

      gsap.set(targets, { autoAlpha: 0, y: 24 });
      if (ctaRef.current) {
        gsap.set(ctaRef.current, {
          autoAlpha: 0,
          y: 20,
          scale: 0.96,
        });
      }

      const sharedTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          scroller: triggerScroller,
          start: "top 82%",
          end: "bottom 38%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
        defaults: {
          ease: "power2.out",
          duration: 0.72,
        },
      });

      if (eyebrowRef.current) {
        sharedTimeline.to(eyebrowRef.current, { autoAlpha: 0.65, y: 0 }, 0);
      }
      if (lineOneRef.current) {
        sharedTimeline.to(lineOneRef.current, { autoAlpha: 1, y: 0 }, 0.16);
      }
      if (lineTwoRef.current) {
        sharedTimeline.to(lineTwoRef.current, { autoAlpha: 1, y: 0 }, 0.38);
      }
      if (lineThreeRef.current) {
        sharedTimeline.to(lineThreeRef.current, { autoAlpha: 1, y: 0 }, 0.62);
      }
      if (ctaRef.current) {
        sharedTimeline.to(
          ctaRef.current,
          { autoAlpha: 1, y: 0, scale: 1 },
          0.88,
        );
      }

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
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
            className="[font-family:var(--font-paraluman-heading)] mb-6 w-full -translate-y-7 text-[clamp(1.45rem,2.8vw,2.35rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0D3B33] sm:mb-8 sm:-translate-y-9"
          >
            Imagine an internship where...
          </p>

          <div className="w-full max-w-[1540px] space-y-3 sm:space-y-4">
            <p
              ref={lineOneRef}
              style={reduceMotion ? { opacity: 1 } : undefined}
              className="[font-family:var(--font-paraluman-heading)] mx-auto w-full text-[clamp(2rem,5.2vw,5rem)] font-black leading-[0.96] tracking-[-0.05em] text-[#0D3B33]"
            >
              You <span className="text-[#07C4A7]">work</span> the way you want
            </p>
            <p
              ref={lineTwoRef}
              style={reduceMotion ? { opacity: 1 } : undefined}
              className="[font-family:var(--font-paraluman-heading)] mx-auto w-full text-[clamp(2rem,5.2vw,5rem)] font-black leading-[0.96] tracking-[-0.05em] text-[#0D3B33]"
            >
              Your <span className="text-[#07C4A7]">skills</span> matter more
              than experience
            </p>
            <p
              ref={lineThreeRef}
              style={reduceMotion ? { opacity: 1 } : undefined}
              className="[font-family:var(--font-paraluman-heading)] mx-auto w-full text-[clamp(2rem,5.2vw,5rem)] font-black leading-[0.96] tracking-[-0.05em] text-[#0D3B33]"
            >
              You do work that <span className="text-[#07C4A7]">matters</span>.
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

function HeroDots({ className }: { className?: string }) {
  return (
    <div className={cn("absolute grid grid-cols-3 gap-4 opacity-60", className)}>
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#10A37F]/65" />
      ))}
    </div>
  );
}

function HeroWorkflowScene({ reduceMotion }: { reduceMotion: boolean }) {
  const pulseLine = reduceMotion
    ? ""
    : "[animation:hero-line-pulse_5s_ease-in-out_infinite]";
  const driftGlow = reduceMotion
    ? ""
    : "[animation:hero-glow-drift_14s_ease-in-out_infinite]";
  const driftSlow = reduceMotion
    ? ""
    : "[animation:hero-float-slow_10s_ease-in-out_infinite]";
  const dashFlow = reduceMotion
    ? ""
    : "[animation:hero-dash-flow_18s_linear_infinite]";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#F8FFFC]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,255,252,0.94)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_92%,rgba(16,163,127,0.12),transparent_22%),radial-gradient(circle_at_92%_4%,rgba(16,163,127,0.14),transparent_24%),radial-gradient(circle_at_50%_46%,rgba(255,255,255,0.99),rgba(255,255,255,0.96)_38%,rgba(255,255,255,0)_70%)]" />
      <div
        className={cn(
          "absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(16,163,127,0.085)_1px,transparent_1px),linear-gradient(90deg,rgba(16,163,127,0.085)_1px,transparent_1px)] [background-size:44px_44px]",
          driftGlow,
        )}
      />
      <div className="absolute right-[12%] top-[43%] hidden h-[15rem] w-[18rem] rounded-[1.6rem] border border-white/60 bg-white/18 shadow-[0_30px_80px_-60px_rgba(6,78,59,0.24)] backdrop-blur-[2px] lg:block" />

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 840"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M228 444C234 216 428 108 740 102C1024 96 1230 182 1326 336"
          fill="none"
          stroke="#10A37F"
          strokeOpacity="0.24"
          strokeWidth="1.5"
          strokeDasharray="7 9"
          className={cn(pulseLine, dashFlow)}
        />
        <path
          d="M392 728C496 850 738 878 992 848C1166 828 1316 770 1392 666"
          fill="none"
          stroke="#10A37F"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeDasharray="7 9"
          className={cn(pulseLine, dashFlow)}
        />
        <path
          d="M158 536H228M364 536H432"
          fill="none"
          stroke="#10A37F"
          strokeOpacity="0.36"
          strokeWidth="1.6"
          strokeDasharray="7 9"
        />
        <circle cx="158" cy="536" r="4.5" fill="#10A37F" fillOpacity="0.72" />
        <circle cx="228" cy="536" r="4.5" fill="#10A37F" fillOpacity="0.72" />
        <circle cx="364" cy="536" r="4.5" fill="#10A37F" fillOpacity="0.72" />
        <circle cx="432" cy="536" r="4.5" fill="#10A37F" fillOpacity="0.72" />
      </svg>

      <HeroDots className={cn("left-[4%] top-[30%] hidden md:grid", driftSlow)} />
      <HeroDots className={cn("right-[9%] top-[15%] hidden lg:grid", driftSlow)} />
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
  const sharedHeroBottomFade =
    "pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(231,255,250,0.8)_100%)]";

  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[100vh] bg-white px-6 pb-16 pt-16 sm:px-10 sm:pb-20 sm:pt-20 lg:px-16 xl:px-24">
        <Link
          href="/"
          className="absolute left-4 top-4 z-20 inline-flex transition-opacity duration-200 hover:opacity-70 sm:left-6 sm:top-6"
        >
          <Image
            src="/BetterInternshipLogo.png"
            alt="BetterInternship"
            width={40}
            height={40}
            className="h-10 w-10 sm:h-12 sm:w-12"
            priority
          />
        </Link>
        <HeroWorkflowScene reduceMotion={reduceMotion} />
        <div className={sharedHeroBottomFade} />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-10 sm:gap-12">
          <div className="flex min-h-[58vh] w-full items-center justify-center md:min-h-[64vh]">
            <HeroMainContent
              reduceMotion={reduceMotion}
              onJumpToListings={onJumpToListings}
            />
          </div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985, y: 24 }}
            animate={reduceMotion ? undefined : { scale: 1, y: 0 }}
            whileInView={
              reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
            }
            viewport={{ once: true, amount: 0.42 }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full overflow-hidden rounded-[0.5em] border border-[#07C4A7]/20 bg-[#0D3B33] shadow-[0_28px_80px_-48px_rgba(13,59,51,0.76)]"
          >
            <div className="aspect-video w-full">
              <video
                className="h-full w-full object-cover"
                src={SOFI_AI_HERO_VIDEO_URL}
                autoPlay
                muted
                playsInline
                controls
                preload="metadata"
                aria-label="Sofi AI product overview video"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WorkWithFounder() {
  return (
    <div className="space-y-8 px-6 sm:px-10 lg:px-16 xl:px-24">
      <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8cf5e4] sm:text-xs">
        Work with
      </p>
      <div className="rounded-[0.33em]">
        <div className="flex flex-col items-start gap-6 text-left sm:flex-row sm:items-end">
          <div className="relative flex h-52 w-52 flex-shrink-0 items-center justify-center overflow-hidden rounded-[0.33em] border-2 border-white/20 bg-white shadow-xl sm:h-64 sm:w-64">
            <Image
              src={FOUNDER_PROFILE.image}
              alt="Sofia Nicole Sy portrait"
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <Link
              href={FOUNDER_PROFILE.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 [font-family:var(--font-paraluman-heading)] text-2xl font-black uppercase tracking-tight sm:text-3xl"
            >
              <span className="text-white transition-colors">
                {FOUNDER_PROFILE.name}
              </span>
              <ArrowUpRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            <p className="mt-3 whitespace-pre-line [font-family:var(--font-paraluman-mono)] text-base leading-relaxed text-white sm:text-lg">
              {FOUNDER_PROFILE.role}
            </p>
          </div>
        </div>
      </div>
    </div>
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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "group relative flex h-fit w-full min-h-0 flex-col rounded-[0.5em] border p-8 text-left transition-all duration-300 cursor-pointer sm:min-h-[32rem] sm:p-12 lg:p-16",
        isPrimary
          ? "border-[#07C4A7]/20 bg-[linear-gradient(135deg,#ffffff_0%,#f7fffd_45%,#f1fffc_100%)] shadow-[0_32px_64px_-40px_rgba(7,196,167,0.32)] hover:shadow-[0_48px_80px_-48px_rgba(7,196,167,0.42)]"
          : "border-[#07C4A7]/16 bg-[linear-gradient(135deg,#ffffff_0%,#f8fffd_45%,#f7fffd_100%)] shadow-[0_28px_56px_-36px_rgba(7,196,167,0.26)] hover:shadow-[0_42px_72px_-44px_rgba(7,196,167,0.34)]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[0.5em]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(7,196,167,0.08),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(7,196,167,0.06),transparent_45%)] rounded-[0.5em]" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] rounded-t-[0.5em]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${card.accent} 15%, ${card.accent} 85%, transparent 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute right-10 top-10 h-4 w-4 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: card.accent }}
      />
      <div
        className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full opacity-25 blur-3xl group-hover:opacity-40 transition-opacity duration-300"
        style={{ backgroundColor: card.accent }}
      />
      <div
        className="pointer-events-none absolute -left-20 -bottom-16 h-52 w-52 rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: card.accent }}
      />

      <div className="relative z-10 space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07C4A7] mb-4">
            {card.eyebrow}
          </p>
          <h3 className="[font-family:var(--font-paraluman-heading)] text-[clamp(2.4rem,3vw,3.8rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#0D3B33]">
            {card.title}
          </h3>
        </div>

        <p className="text-base leading-7 text-[#265f57] sm:text-lg sm:leading-8 max-w-2xl">
          {card.summary}
        </p>
      </div>

      <div className="relative z-10 mt-auto inline-flex items-center justify-between gap-3 pt-12 text-base font-bold uppercase tracking-[0.12em] text-[#07C4A7] transition-all duration-300 group-hover:text-[#0D3B33] w-full">
        <span>View this role</span>
        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
      </div>
    </motion.button>
  );
}

function ListingModalContent({
  card,
  onApply,
}: {
  card: (typeof LISTING_CARDS)[number];
  onApply: () => void;
}) {
  return (
    <div className="space-y-8 pt-4 text-[#0D3B33] sm:space-y-10 ">
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[#0D3B33]">
          Your internship shall:
        </p>
        <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.5rem,2.35vw,2.02rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#0D3B33]">
          Build a practical frontend for TikTok hook analysis that turns AI
          output into clear product decisions
        </p>
      </div>

      <div>
        <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.12em] text-[#0D3B33]">
          Your internship is a success if you can:
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <p className="text-base leading-7 text-[#184d45]/84">
              Let users submit a TikTok link, caption, script, or hook text in
              one clear flow
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <p className="text-base leading-7 text-[#184d45]/84">
              Show hook score, retention risk, clarity, emotional pull, niche
              fit, and suggested rewrites
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <p className="text-base leading-7 text-[#184d45]/84">
              Include loading, empty, failed, and original-versus-improved
              comparison states
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[0.33em] bg-[#e9fffb] p-5 sm:p-6">
        <p className="text-base leading-7 text-[#184d45]/76">
          Exciting? But before you can start the internship, you need to pass
          our challenge.
        </p>
      </div>

      <div className="pt-3 sm:pt-4">
        <Button asChild className="h-12 w-full rounded-[0.33em]">
          <Link
            href="/super-listing/sofi-ai"
            onClick={onApply}
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
export default function SofiAiCompanyProfilePage() {
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
        "relative isolate min-h-screen bg-[#f7fffd] text-black",
        "[&_*]:selection:bg-[#0D3B33]/20 [&_*]:selection:text-[#0D3B33]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_12%,rgba(7,196,167,0.12),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(7,196,167,0.1),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(7,196,167,0.07),transparent_44%)]" />
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
        @keyframes hero-float-slow {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -10px;
          }
        }
        @keyframes hero-float-alt {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -8px;
          }
        }
        @keyframes hero-line-pulse {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.88;
          }
        }
        @keyframes hero-glow-drift {
          0%,
          100% {
            opacity: 0.52;
          }
          50% {
            opacity: 0.72;
          }
        }
        @keyframes hero-dash-flow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -96;
          }
        }
      `}</style>

      <section>
        <SectionShell className="border-t-0 bg-[#0D3B33] py-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(7,196,167,0.16),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(255,255,255,0.07),transparent_30%),linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:auto,auto,28px_28px,28px_28px] opacity-40" />
          <RevealBlock inView={sectionRevealMotion} className="w-full">
            <WorkWithFounder />
          </RevealBlock>
        </SectionShell>

        <SectionShell className="border-t-0 bg-[#f4fffd] py-0">
          <MeaningfulWorkScrollScene
            reduceMotion={shouldReduceMotion}
            onJumpToListings={scrollToListings}
          />
        </SectionShell>

        <SectionShell className="relative -mt-8 overflow-hidden border-t-0 bg-[linear-gradient(180deg,#e9fffb_0%,#e8fff9_44%,#d7fff6_100%)] py-16 sm:-mt-12 sm:py-24 lg:py-32 min-h-[120vh] flex flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#f4fffd] via-[#e9fffb] to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(7,196,167,0.16),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(13,59,51,0.09),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-100 [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.24)_24%,rgba(0,0,0,0.62)_46%,rgba(0,0,0,0.86)_66%,#000_84%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.24)_24%,rgba(0,0,0,0.62)_46%,rgba(0,0,0,0.86)_66%,#000_84%)] bg-[linear-gradient(to_bottom,rgba(13,59,51,0)_0%,rgba(13,59,51,0.12)_46%,rgba(13,59,51,0.18)_100%),linear-gradient(to_right,rgba(13,59,51,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,59,51,0.06)_1px,transparent_1px)] bg-[size:100%_100%,44px_44px,44px_44px]" />
          <SectionInner className="relative flex flex-col items-center justify-center flex-1 w-full gap-16 sm:gap-20 lg:gap-24">
            <RevealBlock inView={sectionRevealMotion} className="text-center">
              <p
                ref={listingsRef}
                className="[font-family:var(--font-paraluman-heading)] bg-[linear-gradient(110deg,#0D3B33_0%,#07C4A7_24%,#bcfff2_38%,#07C4A7_52%,#35e3ca_66%,#0D3B33_82%,#0D3B33_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(2.8rem,6.5vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.065em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite]"
              >
                Better internships start here.
              </p>
            </RevealBlock>
            <RevealBlock
              variants={STAGGER_CONTAINER_VARIANTS}
              inView={sectionStaggerMotion}
              className="w-full flex items-center justify-center"
            >
              <motion.div
                variants={STAGGER_ITEM_VARIANTS}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.56,
                }}
                className="w-full max-w-4xl relative"
              >
                <ListingCard
                  card={LISTING_CARDS[0]}
                  onSelect={() => {
                    modalRegistry.centeredDetails.open({
                      title: (
                        <span className="[font-family:var(--font-paraluman-heading)] text-2xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#0D3B33] sm:text-[2.05rem]">
                          {LISTING_CARDS[0].title}
                        </span>
                      ),
                      content: (
                        <ListingModalContent
                          card={LISTING_CARDS[0]}
                          onApply={() => modalRegistry.centeredDetails.close()}
                        />
                      ),
                      showHeaderDivider: false,
                      closeOnBackdropClick: true,
                      closeOnEscapeKey: true,
                      showCloseButton: true,
                    });
                  }}
                />
              </motion.div>
            </RevealBlock>
          </SectionInner>
        </SectionShell>

        <SectionShell className="border-t-0 bg-[#f4fffd] py-16 sm:py-20">
          <SectionInner className="space-y-8">
            <RevealBlock
              inView={sectionRevealMotion}
              className="mx-auto max-w-4xl text-center"
            >
              <p className="[font-family:var(--font-paraluman-heading)] mt-2 text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-[#0D3B33]">
                FAQs
              </p>
            </RevealBlock>

            <RevealBlock
              inView={sectionRevealMotion}
              className="mx-auto max-w-4xl"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-0" className="border-[#07C4A7]/12">
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#0D3B33] hover:no-underline sm:text-lg">
                    Do I need a resume to apply?
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45] opacity-70 sm:text-base">
                    No. Sofi AI reviews your challenge output first. Product
                    judgment, practicality, and execution matter most.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-1" className="border-[#07C4A7]/12">
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#0D3B33] hover:no-underline sm:text-lg">
                    How fast will I hear back?
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45] opacity-70 sm:text-base">
                    Our target is to respond within 24 hours so strong
                    applicants can move forward quickly.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2" className="border-[#07C4A7]/12">
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#0D3B33] hover:no-underline sm:text-lg">
                    What kind of work will interns do?
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45] opacity-70 sm:text-base">
                    Real product and startup work. You&apos;ll help turn AI
                    output into interfaces, workflows, and decisions that real
                    businesses can use.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3" className="border-[#07C4A7]/12">
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#0D3B33] hover:no-underline sm:text-lg">
                    Which listings should I apply to?
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45] opacity-70 sm:text-base">
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
