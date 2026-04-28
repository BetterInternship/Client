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
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Linkedin,
  Play,
  Youtube,
} from "lucide-react";
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
import { sofiAiPrimaryListing } from "./data";
import heroBg from "./hero-bg.png";

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

const FEATURE_HEADING_CLASS =
  "[font-family:var(--font-paraluman-heading)] text-[clamp(1.95rem,3.6vw,3.15rem)] font-black leading-[0.96] tracking-[-0.055em]";
const BODY_COPY_CLASS =
  "[font-family:var(--font-paraluman-body)] max-w-[60ch] text-base leading-7 text-[#184d45]/82 sm:text-lg sm:leading-[1.72]";
const LISTING_CARDS = [
  {
    id: "core",
    eyebrow: "Open challenge",
    title: sofiAiPrimaryListing.title,
    summary: sofiAiPrimaryListing.description,
    accent: "#07C4A7",
  },
] as const;
const TRUST_PARTNERS = [
  "OpenAI",
  "AWS",
  "Figma",
  "Notion",
  "Vercel",
  "MongoDB",
] as const;
const TESTIMONIALS = [
  {
    quote:
      "The work felt real from day one. You are not making pretend screens, you are learning how AI products actually get shaped for customers.",
    name: "Mika Tan",
    role: "Product Intern",
    initials: "MT",
  },
  {
    quote:
      "Sofi moves fast in the best way. I learned how to turn messy business problems into simple workflows people can understand.",
    name: "Andre Lee",
    role: "Frontend Intern",
    initials: "AL",
  },
  {
    quote:
      "The feedback loop was direct, practical, and kind. It pushed me to think less like a student and more like a builder.",
    name: "Patricia Cruz",
    role: "Design Intern",
    initials: "PC",
  },
] as const;
const MEDIA_ARTICLES = [
  "Founder story",
  "Startup spotlight",
  "Women in tech",
] as const;
const FAQ_ITEMS = [
  {
    question: "Do I need previous AI experience?",
    answer:
      "No. Strong frontend fundamentals, curiosity, and product taste matter more. You will learn how applied AI products are built through real work.",
  },
  {
    question: "What will the challenge evaluate?",
    answer:
      "The challenge looks at your ability to build a clear interface, make practical product decisions, and communicate how your work helps users.",
  },
  {
    question: "Is this a real internship role?",
    answer:
      "Yes. This is designed around real startup work with Sofi AI, not a simulated classroom project.",
  },
  {
    question: "How do I stand out?",
    answer:
      "Show clean execution, thoughtful tradeoffs, and a strong understanding of the business workflow your interface supports.",
  },
] as const;
const SOFI_AI_LOGO_URL =
  "https://sofitech.ai/_next/static/media/sofi-ai-chat-support-automation-logo-vector.80ec9e4e.png";
const FOUNDER_PROFILE = {
  name: "Sophia Nicole Sy",
  role: "Founder of Sofi AI",
  image:
    "https://media.licdn.com/dms/image/v2/D5603AQHOdvGO-2aSBg/profile-displayphoto-shrink_400_400/B56ZW3MvE4GoAk-/0/1742535326021?e=1778716800&v=beta&t=alkNMb4zoeKaxYFqFDC2jwRqMM2zFwmRF2SLl0oIPpw",
  profileUrl: "https://www.linkedin.com/in/sophia-nicole-sy/",
};

function HeroMainContent({
  reduceMotion,
  onJumpToListings,
}: {
  reduceMotion: boolean;
  onJumpToListings: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/"
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
          <span className="[font-family:var(--font-paraluman-heading)] text-lg font-bold tracking-[-0.035em] text-[#0D3B33] sm:text-xl">
            Internships
          </span>
        </Link>
      </motion.div>

      <h1 className="[font-family:var(--font-paraluman-heading)] mt-4 w-full font-black leading-[0.98] sm:mt-5">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.64,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="block pb-[0.14em]"
        >
          <span className="block bg-[linear-gradient(110deg,#0D3B33_0%,#07C4A7_24%,#bcfff2_38%,#07C4A7_52%,#35e3ca_66%,#0D3B33_82%,#0D3B33_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(2.35rem,11.5vw,4.35rem)] leading-[0.98] tracking-[-0.052em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] lg:text-7xl">
            Learn how AI products
            <br />
            are built at SOFI AI.
          </span>
        </motion.span>
      </h1>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{
          duration: 0.52,
          delay: 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="max-w-[57ch] text-center [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#184d45]/82 sm:text-lg sm:leading-[1.75]"
      >
        We&apos;re a young ambitious team that aims to bring AI to every business
        in the Philippines. If you&apos;re ambitious, this is the place for you.
      </motion.p>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{
          duration: 0.52,
          delay: 0.34,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mt-8 sm:mt-10"
      >
        <ListingsCTA onClick={onJumpToListings} label="I want a chance" size="hero" />
      </motion.div>
    </div>
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

function HeroWorkflowScene({ reduceMotion }: { reduceMotion: boolean }) {
  const bgDrift = reduceMotion
    ? ""
    : "[animation:hero-bg-drift_24s_ease-in-out_infinite]";
  const dashFlow = reduceMotion
    ? ""
    : "[animation:hero-dash-flow_22s_linear_infinite]";
  const nodePulse = reduceMotion
    ? ""
    : "[animation:hero-node-pulse_3.8s_ease-in-out_infinite]";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src={heroBg}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn("absolute inset-0 z-0 object-cover object-center", bgDrift)}
      />
      <div className="absolute inset-0 z-[1] bg-white/10" />
      <div
        className={cn(
          "absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_46%,rgba(16,163,127,0.08),transparent_34%)]",
          reduceMotion ? "" : "[animation:hero-soft-pulse_7s_ease-in-out_infinite]",
        )}
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 840"
        preserveAspectRatio="none"
        className="absolute inset-0 z-[1] h-full w-full"
      >
        <path
          d="M238 426C250 214 434 116 736 112C1018 108 1222 190 1320 338"
          fill="none"
          stroke="#10A37F"
          strokeOpacity="0.16"
          strokeWidth="1.5"
          strokeDasharray="7 9"
          className={dashFlow}
        />
        <path
          d="M354 636C478 772 750 804 1002 752C1170 718 1282 640 1368 532"
          fill="none"
          stroke="#10A37F"
          strokeOpacity="0.13"
          strokeWidth="1.5"
          strokeDasharray="7 9"
        />
        <circle
          cx="246"
          cy="424"
          r="4"
          fill="#10A37F"
          fillOpacity="0.28"
          className={cn(nodePulse, "[transform-box:fill-box] [transform-origin:center]")}
        />
        <circle
          cx="1218"
          cy="194"
          r="4"
          fill="#10A37F"
          fillOpacity="0.28"
          className={cn(nodePulse, "[transform-box:fill-box] [transform-origin:center]")}
        />
      </svg>
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
        <div className={cn(sharedHeroBottomFade, "z-[1]")} />

        <div className="relative z-[2] flex min-h-[calc(100vh-8rem)] w-full items-center justify-center sm:min-h-[calc(100vh-10rem)]">
          <HeroMainContent
            reduceMotion={reduceMotion}
            onJumpToListings={onJumpToListings}
          />
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

  const onMove = (event: React.MouseEvent) => {
    if (prefersReduce) return;
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setTx(((x / rect.width) - 0.5) * max * 2);
    setTy(((y / rect.height) - 0.5) * max * 2);
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
  label,
  className,
  size = "default",
}: {
  onClick: () => void;
  label: string;
  className?: string;
  size?: "default" | "hero";
}) {
  return (
    <MagneticButton className={cn("w-full sm:w-auto", className)}>
      <Button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative isolate inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-[0.33em] bg-[linear-gradient(135deg,#07C4A7_0%,#078a76_52%,#0D3B33_100%)] [font-family:var(--font-paraluman-heading)] font-bold uppercase tracking-[0.1em] text-white shadow-[0_16px_36px_-22px_rgba(13,59,51,0.58)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:text-white hover:shadow-[0_22px_42px_-24px_rgba(13,59,51,0.68)] motion-reduce:hover:translate-y-0 sm:w-auto",
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
              "relative z-10 text-white group-hover:text-white",
              size === "hero" ? "h-5 w-5" : "h-4 w-4",
            )}
          />
        </span>
      </Button>
    </MagneticButton>
  );
}

function SectionShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("relative overflow-hidden border-t border-[#0D3B33]/10", className)}>
      {children}
    </section>
  );
}

function SectionInner({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16 xl:px-24", className)}>
      {children}
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

function TrustStripe() {
  return (
    <SectionShell className="border-t-0 bg-[#f6fffc] py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(13,59,51,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,59,51,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40" />
      <SectionInner className="relative space-y-8">
        <p className="text-center [font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.22em] text-[#0D3B33]/74">
          Trusted by teams building real products
        </p>
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden border-t border-dashed border-[#10A37F]/36 lg:block" />
          {TRUST_PARTNERS.map((partner) => (
            <div
              key={partner}
              className="relative z-10 flex min-h-20 items-center justify-center rounded-[0.5em] border border-[#10A37F]/12 bg-white px-6 shadow-[0_18px_42px_-34px_rgba(13,59,51,0.38)] transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="[font-family:var(--font-paraluman-heading)] text-xl font-black tracking-[-0.04em] text-[#0D3B33]/88">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}

function WallOfLove() {
  return (
    <SectionShell className="border-t-0 bg-[#f9fffd] py-16 sm:py-20">
      <SectionInner className="grid gap-10 lg:grid-cols-[0.72fr_1.58fr] lg:items-start">
        <div className="max-w-sm">
          <p className="[font-family:var(--font-paraluman-mono)] text-xs font-semibold uppercase tracking-[0.16em] text-[#10A37F]">
            Wall of love
          </p>
          <h2 className="[font-family:var(--font-paraluman-heading)] mt-4 text-[clamp(2rem,4vw,3.1rem)] font-black leading-[1.02] tracking-[-0.055em] text-[#0D3B33]">
            What <span className="text-[#10A37F]">interns</span> say
          </h2>
          <p className="mt-5 text-base leading-7 text-[#184d45]/76">
            Real experiences from real interns who shipped, learned, and grew
            with Sofi AI.
          </p>
          <div className="mt-8 hidden gap-3 lg:flex">
            {["prev", "next"].map((item) => (
              <span
                key={item}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#10A37F]/18 bg-white text-[#0D3B33]"
              >
                <ArrowRight
                  className={cn("h-4 w-4", item === "prev" && "rotate-180")}
                />
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <article
                key={item.name}
                className="rounded-[0.5em] border border-[#0D3B33]/8 bg-white p-6 text-[#0D3B33] shadow-[0_24px_60px_-46px_rgba(13,59,51,0.38)] transition-transform duration-300 hover:-translate-y-1 sm:p-7"
              >
                <p className="[font-family:var(--font-paraluman-heading)] text-5xl font-black leading-none text-[#10A37F]">
                  &ldquo;
                </p>
                <p className="mt-2 text-sm leading-7 text-[#0D3B33]/82 sm:text-base">
                  {item.quote}
                </p>
                <div className="mt-8 h-px w-10 bg-[#10A37F]/28" />
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DFF7EE] text-sm font-bold text-[#0D3B33]">
                    {item.initials}
                  </div>
                  <div>
                    <p className="[font-family:var(--font-paraluman-heading)] text-sm font-bold">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#184d45]/58">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2, 3].map((item) => (
              <span
                key={item}
                className={cn(
                  "h-2 w-2 rounded-full",
                  item === 0 ? "bg-[#10A37F]" : "bg-[#DFF7EE]",
                )}
              />
            ))}
          </div>
        </div>
      </SectionInner>
    </SectionShell>
  );
}

function MediaSpotlight() {
  return (
    <SectionShell className="border-t-0 bg-[#f9fffd] py-8 sm:py-10">
      <SectionInner>
        <div className="grid gap-8 rounded-[0.65em] bg-[#0D3B33] p-6 text-white shadow-[0_30px_80px_-48px_rgba(13,59,51,0.9)] sm:p-9 lg:grid-cols-[0.7fr_1.55fr] lg:items-center">
          <div className="space-y-6">
            <p className="[font-family:var(--font-paraluman-mono)] text-xs font-semibold uppercase tracking-[0.18em] text-[#8cf5e4]">
              As seen in the media
            </p>
            <div>
              <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(2rem,4vw,3.35rem)] font-black leading-[1.02] tracking-[-0.055em]">
                Sofi AI in the <span className="text-[#10E6C3]">spotlight</span>
              </h2>
              <p className="mt-5 max-w-sm text-base leading-7 text-white/72">
                Creator features, deep-dive articles, and conversations about
                the future of student work.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-[0.33em] border-[#10E6C3]/60 bg-transparent px-6 text-[#8cf5e4] transition-transform duration-300 hover:-translate-y-1 hover:bg-[#10A37F]/12 hover:text-white"
            >
              <Link href="https://sofitech.ai/" target="_blank" rel="noreferrer">
                Explore media
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
            <article className="group min-h-[19rem] rounded-[0.45em] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06))] p-4 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:-translate-y-1">
              <div className="flex h-full flex-col justify-between rounded-[0.35em] bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.28),transparent_34%),linear-gradient(135deg,rgba(16,163,127,0.45),rgba(13,59,51,0.15))] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[0.25em] bg-red-500 text-white">
                  <Play className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <h3 className="[font-family:var(--font-paraluman-heading)] text-xl font-bold leading-tight tracking-[-0.035em]">
                    I interned at Sofi AI and here&apos;s what I learned
                  </h3>
                  <p className="mt-2 text-xs text-white/62">
                    Jenny Lee &bull; 1.2M views
                  </p>
                </div>
              </div>
            </article>
            <div className="grid gap-4">
            {MEDIA_ARTICLES.map((article) => (
              <article
                key={article}
                className="rounded-[0.5em] border border-white/12 bg-white p-5 text-[#0D3B33] shadow-[0_18px_46px_-36px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black tracking-[-0.04em]">
                    {article}
                  </p>
                  <ArrowUpRight className="h-4 w-4 text-[#10A37F]" />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#184d45]/70">
                  A closer look at Sofi AI&apos;s momentum, culture, and work.
                </p>
              </article>
            ))}
            </div>
          </div>
        </div>
      </SectionInner>
    </SectionShell>
  );
}

function FeaturedInternship({
  onSelect,
}: {
  onSelect: () => void;
}) {
  return (
    <SectionShell className="border-t-0 bg-[#f9fffd] py-8 sm:py-10">
      <SectionInner>
        <div className="grid gap-8 rounded-[0.65em] bg-[#e8fff9] p-6 shadow-[0_24px_70px_-52px_rgba(13,59,51,0.48)] sm:p-9 lg:grid-cols-[0.65fr_1.45fr] lg:items-center">
          <div>
            <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.18em] text-[#0D3B33]/72">
              Featured opportunity
            </p>
            <h2 className="[font-family:var(--font-paraluman-heading)] mt-4 text-[clamp(2rem,4vw,3.2rem)] font-black leading-[1.02] tracking-[-0.055em] text-[#0D3B33]">
              This week&apos;s mega <span className="text-[#10A37F]">highlight</span>
            </h2>
            <p className="mt-5 max-w-xs text-base leading-7 text-[#184d45]/76">
              High-impact work. Real ownership. Built for students.
            </p>
          </div>
          <button
            type="button"
            onClick={onSelect}
            className="group relative w-full overflow-hidden rounded-[0.55em] border border-[#10A37F]/16 bg-white p-7 text-left shadow-[0_28px_70px_-48px_rgba(13,59,51,0.58)] transition-transform duration-300 hover:-translate-y-1 sm:p-9"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_22%,rgba(16,163,127,0.13),transparent_28%)]" />
            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.16em] text-[#10A37F]">
                  Open Challenge
                </p>
                <h3 className="[font-family:var(--font-paraluman-heading)] mt-4 text-[clamp(1.75rem,3.4vw,2.7rem)] font-black leading-[1.02] tracking-[-0.05em] text-[#0D3B33]">
                  Frontend Engineer Intern
                </h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-[#184d45]/78">
                  Build product interfaces for a fast-growing applied AI
                  startup, starting with a frontend for a TikTok hook-analysis
                  backend.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {["React", "TypeScript", "Tailwind CSS"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#10A37F]/18 bg-[#e9fffb] px-4 py-2 text-xs font-semibold text-[#0D3B33]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-9 inline-flex items-center gap-2 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-[#10A37F]">
                  View role details
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              <div className="hidden h-32 w-32 items-center justify-center rounded-[0.5em] bg-[#DFF7EE] text-[#10A37F] md:flex">
                <span className="[font-family:var(--font-paraluman-mono)] text-5xl font-bold">
                  &lt;/&gt;
                </span>
              </div>
            </div>
          </button>
        </div>
      </SectionInner>
    </SectionShell>
  );
}

function SofiFaq() {
  return (
    <SectionShell className="border-t-0 bg-[#f9fffd] py-8 sm:py-10">
      <SectionInner className="space-y-8 rounded-[0.65em] bg-white/72 py-10 shadow-[0_20px_70px_-58px_rgba(13,59,51,0.38)]">
        <div>
          <p className="[font-family:var(--font-paraluman-mono)] text-xs font-semibold uppercase tracking-[0.16em] text-[#10A37F]">
            FAQs
          </p>
          <h2 className="[font-family:var(--font-paraluman-heading)] mt-3 text-[clamp(1.8rem,3.4vw,2.5rem)] font-bold leading-tight tracking-[-0.04em] text-[#0D3B33]">
            Frequently asked questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full rounded-[0.45em] border border-[#10A37F]/12 bg-white shadow-[0_18px_48px_-42px_rgba(13,59,51,0.45)]">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="border-[#10A37F]/14"
            >
              <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-bold tracking-[-0.025em] text-[#0D3B33] hover:no-underline sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45]/76 sm:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionInner>
    </SectionShell>
  );
}

function CompactFooter() {
  return (
    <footer className="bg-[#063b34] px-6 py-12 text-white sm:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black tracking-[-0.04em]">
            BetterInternship &times; <span className="text-[#10E6C3]">Sofi AI</span>
          </p>
          <p className="mt-2 text-sm text-white/62">
            Real work. Real impact. Built for students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[Linkedin, Instagram, Youtube].map((Icon, index) => (
            <a
              key={index}
              href="https://sofitech.ai/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/78 transition-colors duration-300 hover:bg-white hover:text-[#0D3B33]"
              aria-label="Sofi AI social link"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function SofiAiCompanyProfilePage() {
  const shouldReduceMotion = useReducedMotion();
  const modalRegistry = useModalRegistry();
  const listingsRef = useRef<HTMLDivElement | null>(null);

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
        @keyframes hero-bg-drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1.01);
          }
          50% {
            transform: translate3d(-8px, -8px, 0) scale(1.01);
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
        @keyframes hero-node-pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        @keyframes hero-soft-pulse {
          0%,
          100% {
            opacity: 0.28;
          }
          50% {
            opacity: 0.62;
          }
        }
      `}</style>

      <section>
        <TrustStripe />
        <WallOfLove />
        <MediaSpotlight />
        <div ref={listingsRef}>
          <FeaturedInternship
            onSelect={() => {
              modalRegistry.centeredDetails.open({
                title: (
                  <span className="[font-family:var(--font-paraluman-heading)] text-2xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#0D3B33] sm:text-[2.05rem]">
                    Frontend Engineer Intern
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
        </div>
        <SofiFaq />
        <CompactFooter />
      </section>
    </main>
  );
}
