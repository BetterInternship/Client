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
import { pccPrimaryListing, pccProfile } from "./data";

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
const PCC_HERO_IMAGE_URL =
  "https://www.philippinechamber.com/_next/image?url=https%3A%2F%2Fwww.philippinechamber.com%3A5020%2FUploads%2FMediaLib%2Fbanner_40_11bccb63.jpg&w=1920&q=75";
const PCC_LOGO_URL =
  "https://www.philippinechamber.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimg_pcci_logo.35f015b9.png&w=1200&q=75";
const SPONSOR_BRANDS = [
  {
    name: "Huawei",
    logoUrl:
      "https://www.philippinechamber.com/_next/image?url=https%3A%2F%2Fwww.philippinechamber.com%3A5020%2FUploads%2FSponsorsAndPartners%2Fhuawei_1d5c2f7d.jpg&w=1200&q=75",
  },
  {
    name: "Adobe",
    logoUrl:
      "https://www.philippinechamber.com/_next/image?url=https%3A%2F%2Fwww.philippinechamber.com%3A5020%2FUploads%2FSponsorsAndPartners%2Fadobe_8114ef44.jpg&w=1200&q=75",
  },
  {
    name: "San Miguel Corporation",
    logoUrl:
      "https://www.philippinechamber.com/_next/image?url=https%3A%2F%2Fwww.philippinechamber.com%3A5020%2FUploads%2FSponsorsAndPartners%2Fsanmiguelcorporation_8b1a66f8.jpg&w=1200&q=75",
  },
  {
    name: "The Philippine Star",
    logoUrl:
      "https://www.philippinechamber.com/_next/image?url=https%3A%2F%2Fwww.philippinechamber.com%3A5020%2FUploads%2FSponsorsAndPartners%2Fthephilippinestar_d9920f46.jpg&w=1200&q=75",
  },
  {
    name: "Megaworld Corporation",
    logoUrl:
      "https://www.philippinechamber.com/_next/image?url=https%3A%2F%2Fwww.philippinechamber.com%3A5020%2FUploads%2FSponsorsAndPartners%2Fmegaworldcorporation_61d14dbf.png&w=1200&q=75",
  },
  {
    name: "GMA Network",
    logoUrl:
      "https://www.philippinechamber.com/_next/image?url=https%3A%2F%2Fwww.philippinechamber.com%3A5020%2FUploads%2FSponsorsAndPartners%2Fgmanetwork_9893a040.png&w=1200&q=75",
  },
  {
    name: "Manila Bulletin",
    logoUrl:
      "https://www.philippinechamber.com/_next/image?url=https%3A%2F%2Fwww.philippinechamber.com%3A5020%2FUploads%2FSponsorsAndPartners%2Fmanilabulletin_3d84f575.jpg&w=1200&q=75",
  },
] as const;
const LISTING_CARDS = [
  {
    id: "core",
    title: pccPrimaryListing.title,
    summary:
      "Deliver one practical improvement that helps Philippine businesses navigate a high-friction process",
    metrics: [
      "Reduce one workflow turnaround time by at least 30%",
      "Lower recurring support escalations in your selected process",
      "Deliver a pilot-ready output with clear implementation steps",
    ],
    supporting:
      "Before internship onboarding, you complete a challenge that mirrors real chamber workflow design.",
    accent: "#68b8ff",
  },
  {
    id: "digital",
    eyebrow: "Programs Track",
    title: "Programs and Partnerships Intern",
    summary:
      "Support and redesign member-facing programs so partner coordination and delivery become faster and clearer.",
    metrics: [
      "Improve readiness and quality of event/program deliverables",
      "Reduce manual follow-up cycles for partner coordination",
      "Ship one measurable workflow improvement during your internship",
    ],
    supporting:
      "You will work with operations and external stakeholders to move from planning to implementation quickly.",
    accent: "#92cfff",
  },
  {
    id: "ops",
    eyebrow: "Policy Track",
    title: "Policy Research and Execution Intern",
    summary:
      "Turn policy and ecosystem insights into actionable recommendations teams can pilot.",
    metrics: [
      "Clarify one complex policy workflow into an executable playbook",
      "Improve decision turnaround for a high-impact business issue",
      "Produce one implementation-grade recommendation package",
    ],
    supporting:
      "Your scope focuses on practical outputs that support Philippine enterprise competitiveness.",
    accent: "#b3dcff",
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
        className="flex items-center gap-3"
      >
        <Link
          href={pccProfile.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-3 transition-all duration-300 hover:opacity-90"
        >
          <Image
            src={PCC_LOGO_URL}
            alt="Philippine Chamber of Commerce logo"
            width={160}
            height={48}
            className="h-auto w-[8.5rem] invert sm:w-[10rem]"
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
          <span className="block bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_24%,#badbfd_38%,#2574BB_52%,#5eaeea_66%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(2.35rem,11.5vw,4.35rem)] leading-[0.98] tracking-[-0.052em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] lg:text-7xl">
            Help Philippine Businesses Move Faster.
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
        Work on real constraints, not simulations. Build solutions that improve
        how businesses access programs, comply faster, and coordinate with
        chamber partners.
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
          label="Show your work"
          size="hero"
          className="mt-4"
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
              src={PCC_HERO_IMAGE_URL}
              alt="Philippine Chamber of Commerce banner"
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

function SponsorMarquee() {
  const repeated = [...SPONSOR_BRANDS, ...SPONSOR_BRANDS];

  return (
    <div className="space-y-6 px-6 sm:px-10 lg:px-16 xl:px-24">
      <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8fceff] sm:text-xs">
        Sponsor and Partner Brands
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#173f69] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#173f69] to-transparent sm:w-24" />
        <div className="pcc-sponsor-track flex w-max items-center gap-3 sm:gap-4">
          {repeated.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex h-16 w-36 shrink-0 items-center justify-center rounded-[0.33em] border border-white/15 bg-white px-2 shadow-[0_14px_32px_-24px_rgba(0,0,0,0.45)] sm:h-20 sm:w-44"
            >
              <div className="relative h-10 w-full sm:h-12">
                <Image
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
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
          ? "border-[#2574BB]/20 bg-[linear-gradient(135deg,#ffffff_0%,#fbfdff_45%,#f4faff_100%)] shadow-[0_32px_64px_-40px_rgba(37,116,187,0.32)] hover:shadow-[0_48px_80px_-48px_rgba(37,116,187,0.42)]"
          : "border-[#2574BB]/16 bg-[linear-gradient(135deg,#ffffff_0%,#fcfdff_45%,#f7fbff_100%)] shadow-[0_28px_56px_-36px_rgba(37,116,187,0.26)] hover:shadow-[0_42px_72px_-44px_rgba(37,116,187,0.34)]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[0.5em]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(104,184,255,0.08),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(37,116,187,0.06),transparent_45%)] rounded-[0.5em]" />
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68b8ff] mb-4">
            {card.eyebrow}
          </p>
          <h3 className="[font-family:var(--font-paraluman-heading)] text-[clamp(2.4rem,3vw,3.8rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#0f2f54]">
            {card.title}
          </h3>
        </div>

        <p className="text-base leading-7 text-[#2d5a8a] sm:text-lg sm:leading-8 max-w-2xl">
          {card.summary}
        </p>
      </div>

      <div className="relative z-10 mt-auto inline-flex items-center justify-between gap-3 pt-12 text-base font-bold uppercase tracking-[0.12em] text-[#2574BB] transition-all duration-300 group-hover:text-[#0f2f54] w-full">
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
    <div className="space-y-8 pt-4 text-[#123f6b] sm:space-y-10 ">
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[#4f7598]">
          Your internship shall:
        </p>
        <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.5rem,2.35vw,2.02rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#123f6b]">
          Deliver one practical improvement that helps Philippine businesses
          navigate a high-friction process
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
              Reduce a selected workflow turnaround time by at least 30% with a
              clear before/after definition
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <p className="text-base leading-7 text-[#173957]/84">
              Improve completion clarity and cut recurring support escalations
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: card.accent }}
            />
            <p className="text-base leading-7 text-[#173957]/84">
              Deliver a pilot-ready recommendation package stakeholders can test
              immediately
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[0.33em] bg-[#edf4fc] p-5 sm:p-6">
        <p className="text-base leading-7 text-[#173957]/76">
          Exciting? But before you can start the internship, you need to pass
          our challenge.
        </p>
      </div>

      <div className="pt-3 sm:pt-4">
        <Button asChild className="h-12 w-full rounded-[0.33em]">
          <Link
            href="/super-listing/pcc"
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
export default function PccCompanyProfilePage() {
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

        @keyframes pcc-sponsor-marquee-rtl {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .pcc-sponsor-track {
          animation: pcc-sponsor-marquee-rtl 36s linear infinite;
          will-change: transform;
        }
      `}</style>

      <section>
        <SectionShell className="border-t-0 bg-[#173f69] py-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(143,206,255,0.16),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(255,255,255,0.07),transparent_30%),linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:auto,auto,28px_28px,28px_28px] opacity-40" />
          <RevealBlock inView={sectionRevealMotion} className="w-full">
            <SponsorMarquee />
          </RevealBlock>
        </SectionShell>

        <SectionShell className="border-t-0 bg-[#f4f8fc] py-0">
          <MeaningfulWorkScrollScene
            reduceMotion={shouldReduceMotion}
            onJumpToListings={scrollToListings}
          />
        </SectionShell>

        <SectionShell className="relative -mt-8 overflow-hidden border-t-0 bg-[linear-gradient(180deg,#edf4fc_0%,#e5effa_44%,#dbe9f8_100%)] py-16 sm:-mt-12 sm:py-24 lg:py-32 min-h-[120vh] flex flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#f4f8fc] via-[#eef4fc] to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(127,192,255,0.16),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(23,63,105,0.09),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-100 [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.24)_24%,rgba(0,0,0,0.62)_46%,rgba(0,0,0,0.86)_66%,#000_84%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.24)_24%,rgba(0,0,0,0.62)_46%,rgba(0,0,0,0.86)_66%,#000_84%)] bg-[linear-gradient(to_bottom,rgba(23,63,105,0)_0%,rgba(23,63,105,0.12)_46%,rgba(23,63,105,0.18)_100%),linear-gradient(to_right,rgba(23,63,105,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,63,105,0.06)_1px,transparent_1px)] bg-[size:100%_100%,44px_44px,44px_44px]" />
          <SectionInner className="relative flex flex-col items-center justify-center flex-1 w-full gap-16 sm:gap-20 lg:gap-24">
            <RevealBlock inView={sectionRevealMotion} className="text-center">
              <p
                ref={listingsRef}
                className="[font-family:var(--font-paraluman-heading)] bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_24%,#badbfd_38%,#2574BB_52%,#5eaeea_66%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(2.8rem,6.5vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.065em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite]"
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
                        <span className="[font-family:var(--font-paraluman-heading)] text-2xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#123f6b] sm:text-[2.05rem]">
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

        <SectionShell className="border-t-0 bg-[#f4f9ff] py-16 sm:py-20">
          <SectionInner className="space-y-8">
            <RevealBlock
              inView={sectionRevealMotion}
              className="mx-auto max-w-4xl text-center"
            >
              <p className="[font-family:var(--font-paraluman-heading)] mt-2 text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-[#123f6b]">
                FAQs
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
                    No. Philippine Chamber of Commerce reviews your challenge
                    output first. Thinking quality, practicality, and execution
                    matter most.
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
                    Real operational and policy work. You&apos;ll help improve
                    business-facing workflows that affect Philippine
                    enterprises.
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
