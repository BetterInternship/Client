"use client";

import Image from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SplitFlap, Presets } from "react-split-flap";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { cebuPacificPrimaryListing, cebuPacificProfile } from "./data";
import cebuPacificLogo from "../../super-listing/cebu-pacific/logo.png";
import meaningfulWorkImage from "../../super-listing/cebu-pacific/1.png";
import literallyEveryoneImage from "../../super-listing/cebu-pacific/2.png";
import massiveImpactImage from "../../super-listing/cebu-pacific/3.png";

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

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80";
const BEST_PLACE_TO_WORK_BADGE_URL =
  "https://greatplacetowork.com.ph/wp-content/uploads/2024/04/Apr2024Apr2025PHL-1.png";
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
const IMAGE_REVEAL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20, scale: 1.04 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

type InViewMotionProps = {
  initial?: "hidden";
  whileInView?: "visible";
  viewport?: { once: true; amount: number };
};

type SplitFlapBoardState = string[];
type HeroVersion = "version1" | "version2" | "version3";

const HERO_BOARD_STATES: SplitFlapBoardState[] = [
  ["BUILD FAST", "NO RESUME", "24H REPLY", "BIG IMPACT"],
  ["FROM CLASS", "TO CEBPAC", "REAL WORK", "OWN EARLY"],
  ["EVERY JUAN", "TRY TASK", "ANY DEGREE", "NEXT STEP"],
  ["20M USERS", "BOOK FLOW", "EASE TRIPS", "NOW BOARD"],
];

const BOARD_CHARS = [...Presets.SPECIAL, ":", "/"];
const MAX_BOARD_LINE_CHARS = 10;
const HERO_HEADLINE_WORDS = [
  "IMAGINE",
  "20",
  "MILLION",
  "TRAVELERS",
  "USING",
  "YOUR",
  "CODE.",
];

function padBoardValue(value: string, width: number) {
  return value.toUpperCase().slice(0, width).padEnd(width, " ");
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

function InsetPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-[#2574BB]/12 bg-white shadow-[0_24px_60px_-44px_rgba(23,63,105,0.45)]",
        className,
      )}
    >
      {children}
    </div>
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

const SplitFlapRow = memo(function SplitFlapRow({
  line,
  lineLength,
  reduceMotion,
}: {
  line: string;
  lineLength: number;
  reduceMotion: boolean;
}) {
  return (
    <div className="py-2 last:border-b-0 sm:py-2.5 lg:py-3">
      <SplitFlap
        value={padBoardValue(line, lineLength)}
        chars={BOARD_CHARS}
        length={lineLength}
        timing={reduceMotion ? 1 : 24}
        hinge
        theme="light"
        size="xlarge"
      />
    </div>
  );
});

function SplitFlapBoard({
  states,
  pauseMs = 5200,
  className,
}: {
  states: SplitFlapBoardState[];
  pauseMs?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const lineLength = MAX_BOARD_LINE_CHARS;
  const [activeIndex, setActiveIndex] = useState(0);
  const displayedRows = states[activeIndex] ?? states[0] ?? [];
  const targetRows = 7;
  const repeatedRows = useMemo(() => {
    if (displayedRows.length === 0) return [];
    return Array.from({ length: targetRows }, (_, index) => {
      const row = displayedRows[index % displayedRows.length];
      return {
        line: row,
        _repeatKey: `row-${index}`,
      };
    });
  }, [displayedRows]);

  useEffect(() => {
    setActiveIndex(0);
  }, [states]);

  useEffect(() => {
    if (states.length <= 1) return;

    const nextIndex = (activeIndex + 1) % states.length;
    const timer = window.setTimeout(() => {
      setActiveIndex(nextIndex);
    }, pauseMs);

    return () => window.clearTimeout(timer);
  }, [
    activeIndex,
    pauseMs,
    states,
  ]);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
      className={cn("relative h-full w-full", className)}
    >
      <div className="flex h-full min-h-[26rem] flex-col justify-center bg-transparent px-6 py-4 sm:min-h-[30rem] sm:px-8 sm:py-5 lg:min-h-0 lg:px-9 lg:py-4 xl:px-10">
        <div className="flex h-full flex-col justify-between">
          {repeatedRows.map((row) => (
            <SplitFlapRow
              key={row._repeatKey}
              line={row.line}
              lineLength={lineLength}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function HeroMainContent({
  reduceMotion,
  onJumpToListings,
  centered = false,
  useFlipperHeadline = false,
  spotlightMode = false,
}: {
  reduceMotion: boolean;
  onJumpToListings: () => void;
  centered?: boolean;
  useFlipperHeadline?: boolean;
  spotlightMode?: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative z-10 flex w-full max-w-3xl flex-col space-y-7 sm:space-y-8",
        centered ? "items-center text-center" : "items-center text-center lg:items-start lg:text-left",
      )}
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
          <span
            className={cn(
              "[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase sm:mt-2.5 sm:text-xs",
              spotlightMode ? "text-[#1b5f99]" : "text-[#2574BB]",
            )}
          >
            Internships
          </span>
        </Link>
      </motion.div>

      {useFlipperHeadline ? (
        <div className="w-full max-w-6xl space-y-3">
          <h1 className="sr-only">Imagine 20 Million Travelers Using YOUR Code.</h1>
          <div
            className={cn(
              "mt-2 flex flex-wrap gap-2",
              centered ? "justify-center" : "justify-center lg:justify-start",
            )}
          >
            {HERO_HEADLINE_WORDS.map((word, index) => (
              <SplitFlap
                key={`${word}-${index}`}
                value={word}
                chars={BOARD_CHARS}
                length={word.length}
                timing={reduceMotion ? 1 : 24}
                hinge
                theme="light"
                size="large"
              />
            ))}
          </div>
        </div>
      ) : (
        <h1 className="[font-family:var(--font-paraluman-heading)] w-full font-black leading-[0.95] text-black">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.64,
              delay: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-2 block pb-[0.08em] bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_22%,#eef7ff_36%,#2574BB_50%,#6fb7ff_64%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-7xl leading-[0.95] tracking-[-0.052em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] [filter:drop-shadow(0_10px_28px_rgba(37,116,187,0.22))]"
          >
            Imagine 20 Million Travelers Using YOUR Code.
          </motion.span>
        </h1>
      )}

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{
          duration: 0.52,
          delay: 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "max-w-[57ch] [font-family:var(--font-paraluman-body)] text-base leading-7 sm:text-lg sm:leading-[1.75]",
          spotlightMode ? "text-[#0d2f51]/84" : "text-[#173957]/82",
        )}
      >
        Have you ever dreamed of reaching millions of users with your code?
        Today&apos;s your lucky day. We&apos;re looking for superstar interns to
        improve our booking website.
        <br />
        <br />
        And, we don&apos;t look at resumes. Anybody has a chance. You just need
        to prove yourself.
      </motion.p>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{
          duration: 0.44,
          delay: 0.48,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "flex flex-col gap-3",
          centered ? "items-center" : "items-center lg:items-start",
        )}
      >
        <ListingsCTA
          onClick={onJumpToListings}
          label="Let me prove myself"
          size="hero"
        />

        <p
          className={cn(
            "[font-family:var(--font-paraluman-body)] text-base leading-7 sm:text-lg sm:leading-[1.75] space-x-6",
            spotlightMode ? "text-[#0d2f51]/84" : "text-[#173957]/82",
          )}
        >
          <span>✔ No resume needed </span>
          <span>✔ Response in 24 hours</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

function HeroPanel({
  reduceMotion,
  onJumpToListings,
  heroVersion,
  onHeroVersionChange,
}: {
  reduceMotion: boolean;
  onJumpToListings: () => void;
  heroVersion: HeroVersion;
  onHeroVersionChange: (version: HeroVersion) => void;
}) {
  const sharedHeroBackground =
    "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(127,192,255,0.22),transparent_24%),radial-gradient(circle_at_78%_76%,rgba(37,116,187,0.1),transparent_28%)]";
  const sharedHeroBottomFade =
    "pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(225,239,252,0.8)_100%)]";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <label className="sr-only" htmlFor="hero-version-toggle">
          Hero version
        </label>
        <select
          id="hero-version-toggle"
          value={heroVersion}
          onChange={(event) =>
            onHeroVersionChange(event.target.value as HeroVersion)
          }
          className="[font-family:var(--font-paraluman-mono)] rounded-md border border-[#173f69]/20 bg-white/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#173f69] shadow-sm outline-none transition focus:border-[#2574BB] focus:ring-2 focus:ring-[#2574BB]/30"
        >
          <option value="version1">Version 1</option>
          <option value="version2">Version 2</option>
          <option value="version3">Version 3</option>
        </select>
      </div>

      {heroVersion === "version1" ? (
        <div className="relative min-h-[100vh] bg-[#eaf2fb]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(12,46,80,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(12,46,80,0.045)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_16%,rgba(17,47,78,0.12)_32%,rgba(9,26,43,0.3)_50%,rgba(6,16,28,0.52)_70%,rgba(3,9,16,0.72)_100%)] [animation:hero-spotlight-breathe_12s_ease-in-out_infinite]" />
          <div className="relative flex min-h-[86vh] items-center justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
            <HeroMainContent
              reduceMotion={reduceMotion}
              onJumpToListings={onJumpToListings}
              centered
              useFlipperHeadline
              spotlightMode
            />
          </div>
        </div>
      ) : null}

      {heroVersion === "version2" ? (
        <div className="relative grid min-h-[100vh] bg-white lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
          <div className={sharedHeroBackground} />
          <div className={sharedHeroBottomFade} />

          <div className="relative flex min-h-[86vh] items-center justify-center overflow-hidden px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20 xl:px-24">
            <HeroMainContent
              reduceMotion={reduceMotion}
              onJumpToListings={onJumpToListings}
            />
          </div>

          <div className="relative flex min-h-[26rem] items-stretch overflow-hidden lg:min-h-[86vh]">
            <div className="relative z-10 h-full w-full">
              <SplitFlapBoard states={HERO_BOARD_STATES} />
            </div>
          </div>
        </div>
      ) : null}

      {heroVersion === "version3" ? (
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
                src={HERO_IMAGE_URL}
                alt="Airplane wing above the clouds"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/52 via-[#173f69]/10 to-transparent" />
            <motion.div
              initial={
                reduceMotion ? false : { opacity: 0, y: -8, scale: 0.94 }
              }
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.52,
                delay: 0.48,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8"
            >
              <div className="relative h-20 w-20 overflow-hidden sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                <Image
                  src={BEST_PLACE_TO_WORK_BADGE_URL}
                  alt="Best Places to Work in the Philippines 2024-2025 badge"
                  fill
                  className="object-contain object-center scale-[1.45]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function CebuPacificCompanyProfilePage() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRevealMotion = getInViewMotionProps(shouldReduceMotion, 0.24);
  const sectionStaggerMotion = getInViewMotionProps(shouldReduceMotion, 0.18);
  const listingsRef = useRef<HTMLDivElement | null>(null);
  const [heroVersion, setHeroVersion] = useState<HeroVersion>("version2");

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
          heroVersion={heroVersion}
          onHeroVersionChange={setHeroVersion}
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
        @keyframes hero-spotlight-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.012);
            opacity: 0.97;
          }
        }
      `}</style>

      <section>
        <SectionShell className="overflow-hidden border-t-0 bg-[#173f69]">
          <SectionInner className="relative">
            <RevealBlock
              inView={sectionRevealMotion}
              className="flex w-full flex-col items-center gap-6 text-center lg:flex-row lg:justify-center lg:text-left"
            >
              <div className="max-w-[42rem] space-y-3">
                <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(2.15rem,4.8vw,4.1rem)] font-light leading-[0.96] tracking-[-0.056em] text-white">
                  Cebu Pacific was named one of the{" "}
                  <span className="bg-[linear-gradient(110deg,#8fceff_0%,#eef7ff_52%,#8fceff_100%)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:runway-shine_7.5s_ease-in-out_infinite] font-black">
                    Philippines&apos; Best Places to Work in
                  </span>{" "}
                  2025.
                </p>
                <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#8fceff]">
                  Recognized by BusinessWorld
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="relative h-24 w-24 overflow-hidden sm:h-28 sm:w-28 lg:h-36 lg:w-36">
                  <Image
                    src={BEST_PLACE_TO_WORK_BADGE_URL}
                    alt="Best Places to Work in the Philippines 2024-2025 badge"
                    fill
                    className="object-contain object-center scale-[1.45]"
                  />
                </div>
              </div>
            </RevealBlock>
          </SectionInner>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(143,206,255,0.22),transparent_30%)]" />
        </SectionShell>

        <SectionShell className="border-t-0">
          <SectionInner className="space-y-6">
            <InsetPanel className="overflow-hidden border-0 bg-transparent shadow-none">
              <RevealBlock
                inView={sectionRevealMotion}
                className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
              >
                <div className="max-lg:order-2 space-y-6 px-6 py-8 sm:px-8 sm:py-10">
                  <p className="[font-family:var(--font-paraluman-heading)] max-w-[20ch] text-[clamp(1.95rem,3.4vw,3rem)] font-black leading-[0.96] tracking-[-0.055em] text-[#173f69]">
                    Meaningful Work
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] max-w-[60ch] text-base leading-7 text-[#173957]/82 sm:text-lg sm:leading-[1.72]">
                    <span className="font-bold">
                      Most internships are grunt work.{" "}
                    </span>
                    Here, you’ll be given trust to build and ship features that
                    millions of Filipinos will use, including your family and
                    friends.
                  </p>
                  <ListingsCTA
                    onClick={scrollToListings}
                    label="Let me prove myself"
                  />
                </div>
                <div className="relative min-h-[20rem] overflow-hidden max-lg:order-1">
                  <RevealBlock
                    variants={IMAGE_REVEAL_VARIANTS}
                    inView={sectionRevealMotion}
                    className="absolute inset-0"
                  >
                    <Image
                      src={meaningfulWorkImage}
                      alt="Passengers walking through an airport terminal"
                      fill
                      className="object-cover"
                    />
                  </RevealBlock>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/35 via-transparent to-transparent" />
                </div>
              </RevealBlock>
            </InsetPanel>
          </SectionInner>
        </SectionShell>

        <SectionShell className="border-t-0">
          <SectionInner className="space-y-6">
            <InsetPanel className="overflow-hidden border-0 bg-transparent shadow-none">
              <RevealBlock
                inView={sectionRevealMotion}
                className="grid lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]"
              >
                <div className="relative min-h-[20rem] overflow-hidden max-lg:order-1">
                  <RevealBlock
                    variants={IMAGE_REVEAL_VARIANTS}
                    inView={sectionRevealMotion}
                    className="absolute inset-0"
                  >
                    <Image
                      src={massiveImpactImage}
                      alt="A Cebu Pacific airplane in flight"
                      fill
                      className="object-cover"
                    />
                  </RevealBlock>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/40 via-transparent to-transparent" />
                </div>
                <div className="max-lg:order-2 space-y-6 px-6 py-8 sm:px-8 sm:py-10">
                  <p className="[font-family:var(--font-paraluman-heading)] max-w-[18ch] text-[clamp(1.95rem,3.3vw,3rem)] font-black leading-[0.96] tracking-[-0.055em] text-[#173f69]">
                    Massive impact
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] max-w-[60ch] text-base leading-7 text-[#173957]/82 sm:text-lg sm:leading-[1.72]">
                    We operate over{" "}
                    <span className="font-bold">190,000 flights</span> a year
                    across nearly{" "}
                    <span className="font-bold">100 aircrafts.</span> Your code
                    will make their travels more delightful.
                  </p>
                  <ListingsCTA
                    onClick={scrollToListings}
                    label="Let me prove myself"
                  />
                </div>
              </RevealBlock>
            </InsetPanel>
          </SectionInner>
        </SectionShell>

        <SectionShell className="border-t-0">
          <SectionInner className="space-y-6">
            <InsetPanel className="overflow-hidden border-0 bg-transparent shadow-none">
              <RevealBlock
                inView={sectionRevealMotion}
                className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
              >
                <div className="max-lg:order-2 space-y-6 px-6 py-8 sm:px-8 sm:py-10">
                  <p className="[font-family:var(--font-paraluman-heading)] max-w-[20ch] text-[clamp(1.95rem,3.4vw,3rem)] font-black leading-[0.96] tracking-[-0.055em] text-[#173f69]">
                    Open to LITERALLY EVERYONE
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] max-w-[60ch] text-base leading-7 text-[#173957]/82 sm:text-lg sm:leading-[1.72]">
                    Again, we won’t look at your resume. Your only goal is to
                    impress us through the challenge. If we’re impressed, you’re
                    in.
                  </p>
                  <ListingsCTA
                    onClick={scrollToListings}
                    label="Let me prove myself"
                  />
                </div>
                <div className="relative min-h-[20rem] overflow-hidden max-lg:order-1">
                  <RevealBlock
                    variants={IMAGE_REVEAL_VARIANTS}
                    inView={sectionRevealMotion}
                    className="absolute inset-0"
                  >
                    <Image
                      src={literallyEveryoneImage}
                      alt="Passengers walking through an airport terminal"
                      fill
                      className="object-cover"
                    />
                  </RevealBlock>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/35 via-transparent to-transparent" />
                </div>
              </RevealBlock>
            </InsetPanel>
          </SectionInner>
        </SectionShell>

        <SectionShell className="overflow-hidden border-t-0 bg-[#173f69]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(143,206,255,0.26),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.09),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
          <SectionInner className="relative space-y-10">
            <RevealBlock
              inView={sectionRevealMotion}
              className="mx-auto max-w-5xl space-y-3 text-center"
            >
              <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#8fceff]">
                Objective
              </p>
              <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(2.1rem,4.5vw,3.35rem)] font-black leading-[0.97] tracking-[-0.045em] text-white">
                Make Cebu Pacific the{" "}
                <span className="bg-[linear-gradient(110deg,#8fceff_0%,#eef7ff_52%,#8fceff_100%)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:runway-shine_7.5s_ease-in-out_infinite]">
                  easiest airline to book
                </span>{" "}
                in the country. The interns will redesign how millions of
                Filipinos book flights.
              </p>
            </RevealBlock>
            <RevealBlock
              variants={STAGGER_CONTAINER_VARIANTS}
              inView={sectionStaggerMotion}
              className="grid gap-6 md:grid-cols-3"
            >
              <motion.article
                variants={STAGGER_ITEM_VARIANTS}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[0.33em] border border-white/14 bg-white/95 px-6 py-8 text-center shadow-[0_12px_26px_-22px_rgba(15,23,42,0.2)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#2574BB_0%,#8fceff_48%,#2574BB_100%)]" />
                <div className="space-y-3">
                  <p className="[font-family:var(--font-paraluman-mono)] text-[10px] font-bold uppercase tracking-[0.16em] text-[#4f7598]">
                    01
                  </p>
                  <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-[1.22] tracking-[-0.01em] text-[#0f2f54]">
                    <span className="text-[#1b5f99]">80%</span> of first-time
                    users complete a flight booking in{" "}
                    <span className="text-[#1b5f99]">&le;60 seconds</span>{" "}
                    without assistance
                  </p>
                </div>
              </motion.article>
              <motion.article
                variants={STAGGER_ITEM_VARIANTS}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[0.33em] border border-white/14 bg-white/95 px-6 py-8 text-center shadow-[0_12px_26px_-22px_rgba(15,23,42,0.2)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#2574BB_0%,#8fceff_48%,#2574BB_100%)]" />
                <div className="space-y-3">
                  <p className="[font-family:var(--font-paraluman-mono)] text-[10px] font-bold uppercase tracking-[0.16em] text-[#4f7598]">
                    02
                  </p>
                  <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-[1.22] tracking-[-0.01em] text-[#0f2f54]">
                    Reduce booking-related complaints/support tickets by{" "}
                    <span className="text-[#1b5f99]">50%</span>
                  </p>
                </div>
              </motion.article>
              <motion.article
                variants={STAGGER_ITEM_VARIANTS}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[0.33em] border border-white/14 bg-white/95 px-6 py-8 text-center shadow-[0_12px_26px_-22px_rgba(15,23,42,0.2)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#2574BB_0%,#8fceff_48%,#2574BB_100%)]" />
                <div className="space-y-3">
                  <p className="[font-family:var(--font-paraluman-mono)] text-[10px] font-bold uppercase tracking-[0.16em] text-[#4f7598]">
                    03
                  </p>
                  <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-[1.22] tracking-[-0.01em] text-[#0f2f54]">
                    Achieve <span className="text-[#1b5f99]">&ge;90%</span> of
                    users rating booking experience as &quot;easy&quot; or
                    &quot;very easy&quot;
                  </p>
                </div>
              </motion.article>
            </RevealBlock>
            <div className="pt-2 justify-center flex">
              <ListingsCTA
                onClick={scrollToListings}
                label="Let me prove myself"
              />
            </div>
          </SectionInner>
        </SectionShell>

        <SectionShell className="overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#e8f2fb_48%,#dcecf9_100%)] py-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(127,192,255,0.18),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(23,63,105,0.1),transparent_24%),linear-gradient(to_right,rgba(23,63,105,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,63,105,0.04)_1px,transparent_1px)] bg-[size:auto,auto,44px_44px,44px_44px]" />
          <SectionInner className="relative space-y-12">
            <RevealBlock
              inView={sectionRevealMotion}
              className="flex flex-col items-center space-y-5 text-center"
            >
              <p className="[font-family:var(--font-paraluman-heading)] bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_22%,#eef7ff_36%,#2574BB_50%,#6fb7ff_64%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(3rem,6.2vw,5.8rem)] font-black leading-[0.88] tracking-[-0.068em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] [filter:drop-shadow(0_10px_28px_rgba(37,116,187,0.18))]">
                Better internships start here.
              </p>
            </RevealBlock>
            <RevealBlock
              variants={STAGGER_CONTAINER_VARIANTS}
              inView={sectionStaggerMotion}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <motion.article
                  variants={STAGGER_ITEM_VARIANTS}
                  className="rounded-[0.33em] border border-[#2574BB]/18 bg-white/85 px-6 py-6 shadow-[0_18px_36px_-28px_rgba(23,63,105,0.28)] backdrop-blur-sm"
                >
                  <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black tracking-[-0.02em] text-[#123f6b]">
                    No resume needed
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] mt-2 text-base leading-7 text-[#173957]/82">
                    We don&apos;t care about credentials. Prove yourself by
                    completing the challenge.
                  </p>
                </motion.article>
                <motion.article
                  variants={STAGGER_ITEM_VARIANTS}
                  className="rounded-[0.33em] border border-[#2574BB]/18 bg-white/85 px-6 py-6 shadow-[0_18px_36px_-28px_rgba(23,63,105,0.28)] backdrop-blur-sm"
                >
                  <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black tracking-[-0.02em] text-[#123f6b]">
                    Challenge-based applications
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] mt-2 text-base leading-7 text-[#173957]/82">
                    We want to look at what you can actually do, not just what
                    you say.
                  </p>
                </motion.article>
                <motion.article
                  variants={STAGGER_ITEM_VARIANTS}
                  className="rounded-[0.33em] border border-[#2574BB]/18 bg-white/85 px-6 py-6 shadow-[0_18px_36px_-28px_rgba(23,63,105,0.28)] backdrop-blur-sm"
                >
                  <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black tracking-[-0.02em] text-[#123f6b]">
                    Response in 24 hours
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] mt-2 text-base leading-7 text-[#173957]/82">
                    You won&apos;t be the only one trying hard. We&apos;ll try
                    our best at responding to you quickly.
                  </p>
                </motion.article>
              </div>
            </RevealBlock>

            <InsetPanel className="overflow-hidden rounded-[0.33em] border border-[#2574BB]/14 shadow-[0_28px_66px_-42px_rgba(23,63,105,0.3)] backdrop-blur-sm max-w-4xl mx-auto">
              <div ref={listingsRef} />
              <RevealBlock
                variants={STAGGER_CONTAINER_VARIANTS}
                inView={sectionStaggerMotion}
                className="space-y-3 p-3 sm:p-4"
              >
                <motion.article
                  variants={STAGGER_ITEM_VARIANTS}
                  className="grid gap-5 rounded-[0.33em] border border-[#2574BB]/18 bg-white px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
                >
                  <div className="space-y-3">
                    <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black uppercase tracking-[-0.02em] text-[#123f6b] sm:text-2xl">
                      {cebuPacificPrimaryListing.title}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#173f69] bg-transparent px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173f69] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#173f69] hover:text-white hover:shadow-[0_16px_34px_-24px_rgba(23,63,105,0.48)] sm:w-auto"
                  >
                    <Link
                      href="/super-listing/cebu-pacific"
                      className="inline-flex items-center gap-2"
                    >
                      View listing
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.article>

                <motion.article
                  variants={STAGGER_ITEM_VARIANTS}
                  className="grid gap-5 rounded-[0.33em] border border-[#2574BB]/18 bg-white px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
                >
                  <div className="space-y-3">
                    <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black uppercase tracking-[-0.02em] text-[#123f6b] sm:text-2xl">
                      Digital Experience Intern
                    </p>
                  </div>
                  <Button
                    asChild
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#173f69] bg-transparent px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173f69] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#173f69] hover:text-white hover:shadow-[0_16px_34px_-24px_rgba(23,63,105,0.48)] sm:w-auto"
                  >
                    <Link
                      href="/super-listing/cebu-pacific"
                      className="inline-flex items-center gap-2"
                    >
                      View listing
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.article>

                <motion.article
                  variants={STAGGER_ITEM_VARIANTS}
                  className="grid gap-5 rounded-[0.33em] border border-[#2574BB]/18 bg-white px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
                >
                  <div className="space-y-3">
                    <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black uppercase tracking-[-0.02em] text-[#123f6b] sm:text-2xl">
                      Operations Innovation Intern
                    </p>
                  </div>
                  <Button
                    asChild
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#173f69] bg-transparent px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173f69] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#173f69] hover:text-white hover:shadow-[0_16px_34px_-24px_rgba(23,63,105,0.48)] sm:w-auto"
                  >
                    <Link
                      href="/super-listing/cebu-pacific"
                      className="inline-flex items-center gap-2"
                    >
                      View listing
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.article>
              </RevealBlock>
            </InsetPanel>
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
                    Choose the role where your skills are strongest, then
                    submit a high-quality challenge response for that listing.
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
