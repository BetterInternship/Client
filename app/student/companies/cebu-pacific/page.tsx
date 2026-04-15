"use client";

import Image from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cebuPacificPrimaryListing, cebuPacificProfile } from "./data";
import cebuPacificLogo from "../../super-listing/cebu-pacific/logo.png";

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
const IMPACT_IMAGE_URL =
  "https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1400&q=80";
const INTERNSHIP_IMAGE_URL =
  "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1400&q=80";
const TEXT_GUTTER = "px-6 sm:px-24  lg:px-16 xl:px-24";
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase())
    .join("");
}

function renderHighlightedQuote(quote: string, highlight: string): ReactNode {
  if (!highlight) return quote;

  const lowerQuote = quote.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const start = lowerQuote.indexOf(lowerHighlight);

  if (start < 0) return quote;

  const end = start + highlight.length;
  return (
    <>
      {quote.slice(0, start)}
      <strong className="font-semibold text-[#0f2f54]">
        {quote.slice(start, end)}
      </strong>
      {quote.slice(end)}
    </>
  );
}

function AnimatedStatValue({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-18% 0px -18% 0px",
  });
  const [displayValue, setDisplayValue] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    if (!isInView) return;

    let frame = 0;
    let startTime: number | null = null;
    const duration = 920;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isInView, reduceMotion, value]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

type InViewMotionProps = {
  initial?: "hidden";
  whileInView?: "visible";
  viewport?: { once: true; amount: number };
};

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

function HeroPanel({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid min-h-[100vh] lg:grid-cols-2">
        <div className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20 xl:px-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(127,192,255,0.22),transparent_24%),radial-gradient(circle_at_78%_76%,rgba(37,116,187,0.1),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(225,239,252,0.8)_100%)]" />
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
                <span className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase text-[#2574BB] sm:mt-2.5 sm:text-xs">
                  Internships
                </span>
              </Link>
            </motion.div>

            <h1 className="[font-family:var(--font-paraluman-heading)] w-full font-black leading-[0.95] text-black">
              <motion.span
                initial={
                  reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }
                }
                animate={
                  reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
                }
                transition={{
                  duration: 0.64,
                  delay: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-2 block pb-[0.08em] bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_22%,#eef7ff_36%,#2574BB_50%,#6fb7ff_64%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-7xl  leading-[0.95] tracking-[-0.052em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] [filter:drop-shadow(0_10px_28px_rgba(37,116,187,0.22))]"
              >
                Imagine 20 Million Travelers Using YOUR Code.
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
              Have you ever dreamed of reaching millions of users with your
              code? Today's your lucky day. We're looking for superstar interns
              to improve our booking website.
              <br />
              <br />
              And, we don't look at resumes. Anybody has a chance. You just need
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
              className="flex flex-col items-center gap-3 lg:items-start"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Button
                  asChild
                  className="group relative isolate inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[0.33em] bg-[linear-gradient(135deg,#2574BB_0%,#1b5f99_52%,#173f69_100%)] px-6 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_16px_36px_-22px_rgba(23,63,105,0.48)] transition-all duration-300 ease-out before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_22%,#eef7ff_36%,#2574BB_50%,#6fb7ff_64%,#1c5f9b_82%,#0f4f8f_100%)] before:bg-[length:220%_100%] before:opacity-0 before:transition-opacity before:duration-300 before:ease-out before:content-[''] hover:-translate-y-0.5 hover:text-white hover:before:opacity-100 group-hover:before:[animation:runway-shine_2.2s_ease-in-out_infinite] hover:shadow-[0_22px_42px_-24px_rgba(23,63,105,0.58)] sm:w-auto"
                >
                  <Link
                    href="/student/super-listing/cebu-pacific"
                    className="relative z-10 inline-flex items-center gap-2 text-white hover:text-white"
                  >
                    <span className="relative z-10 text-white group-hover:text-white">
                      Let me prove myself
                    </span>
                    <ArrowRight className="relative z-10 h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-white" />
                  </Link>
                </Button>
              </MagneticButton>

              <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.13em] text-[#1d5588]/85">
                No resume needed &middot; Response in 24 hours
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative min-h-[22rem] overflow-hidden lg:min-h-[92vh]">
          <motion.div
            initial={reduceMotion ? false : { scale: 1.06, y: 10 }}
            animate={reduceMotion ? undefined : { scale: 1, y: 0 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/52 via-[#173f69]/8 to-transparent" />
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.94 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.52,
              delay: 0.52,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8"
          >
            <div className="relative h-20 w-20 overflow-hidden sm:h-24 sm:w-24 lg:h-28 lg:w-28">
              <Image
                src={BEST_PLACE_TO_WORK_BADGE_URL}
                alt="Best Places to Work in the Philippines 2024-2025 badge"
                fill
                className="object-contain object-center scale-[1.45] "
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function CebuPacificCompanyProfilePage() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRevealMotion = getInViewMotionProps(shouldReduceMotion, 0.24);
  const sectionStaggerMotion = getInViewMotionProps(shouldReduceMotion, 0.18);

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
        <HeroPanel reduceMotion={shouldReduceMotion} />
      </section>
      <style jsx>{`
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
        <SectionShell className="overflow-hidden border-t-0 bg-[#173f69]">
          <SectionInner className="relative">
            <RevealBlock
              inView={sectionRevealMotion}
              className="flex w-full flex-col items-center gap-6 text-center lg:flex-row lg:justify-center lg:text-left"
            >
              <div className="max-w-[42rem] space-y-3">
                <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(2.15rem,4.8vw,4.1rem)] font-light leading-[0.96] tracking-[-0.056em] text-white">
                  Cebu Pacific was named one of the{" "}
                  <span className="font-bold text-white">
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
                <div className="space-y-6 px-6 py-8 sm:px-8 sm:py-10">
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
                </div>
                <div className="relative min-h-[20rem] overflow-hidden">
                  <RevealBlock
                    variants={IMAGE_REVEAL_VARIANTS}
                    inView={sectionRevealMotion}
                    className="absolute inset-0"
                  >
                    <Image
                      src={IMPACT_IMAGE_URL}
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
                <div className="relative min-h-[20rem] overflow-hidden">
                  <RevealBlock
                    variants={IMAGE_REVEAL_VARIANTS}
                    inView={sectionRevealMotion}
                    className="absolute inset-0"
                  >
                    <Image
                      src={INTERNSHIP_IMAGE_URL}
                      alt="A Cebu Pacific airplane in flight"
                      fill
                      className="object-cover"
                    />
                  </RevealBlock>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/40 via-transparent to-transparent" />
                </div>
                <div className="space-y-6 px-6 py-8 sm:px-8 sm:py-10">
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
                <div className="space-y-6 px-6 py-8 sm:px-8 sm:py-10">
                  <p className="[font-family:var(--font-paraluman-heading)] max-w-[20ch] text-[clamp(1.95rem,3.4vw,3rem)] font-black leading-[0.96] tracking-[-0.055em] text-[#173f69]">
                    Open to LITERALLY EVERYONE
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] max-w-[60ch] text-base leading-7 text-[#173957]/82 sm:text-lg sm:leading-[1.72]">
                    Again, we won’t look at your resume. Your only goal is to
                    impress us through the challenge. If we’re impressed, you’re
                    in.
                  </p>
                </div>
                <div className="relative min-h-[20rem] overflow-hidden">
                  <RevealBlock
                    variants={IMAGE_REVEAL_VARIANTS}
                    inView={sectionRevealMotion}
                    className="absolute inset-0"
                  >
                    <Image
                      src={IMPACT_IMAGE_URL}
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
          <div className="pointer-events-none absolute -left-20 top-14 h-52 w-52 rounded-full bg-[#64b4e6]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-16 h-56 w-56 rounded-full bg-[#9bd5ff]/18 blur-3xl" />
          <SectionInner className="relative space-y-8">
            <RevealBlock inView={sectionRevealMotion}>
              <div className="max-w-3xl space-y-4">
                <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(2.15rem,4.2vw,3.3rem)] font-black leading-[0.94] tracking-[-0.055em] text-white">
                  What past interns remember most is the trust.
                </p>
              </div>
            </RevealBlock>
            <RevealBlock
              variants={STAGGER_CONTAINER_VARIANTS}
              inView={sectionStaggerMotion}
              className="grid gap-6 xl:grid-cols-3"
            >
              {cebuPacificProfile.testimonials.map((item) => {
                const tag =
                  item.name === "Nicole S."
                    ? "Worked on booking flow"
                    : item.name === "Marco L."
                      ? "Improved payment UX"
                      : item.name === "Danica R."
                        ? "Shipped product experiments"
                        : "Real product work";
                const highlight =
                  item.name === "Nicole S."
                    ? "your thinking held up"
                    : item.name === "Marco L."
                      ? "Feedback was quick and very specific"
                      : item.name === "Danica R."
                        ? "real product work"
                        : "";

                return (
                  <motion.article
                    key={item.name}
                    variants={STAGGER_ITEM_VARIANTS}
                    whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="flex min-h-[18rem] flex-col justify-between rounded-[0.5em] border border-[#dbe7f2] bg-white px-6 py-7 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-[#c8d8e8] hover:shadow-[0_18px_34px_-22px_rgba(15,23,42,0.24)] sm:px-7"
                  >
                    <div className="space-y-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe7f2] bg-[#f3f8fd] text-[13px] font-black uppercase tracking-[0.1em] text-[#2f628f] [font-family:var(--font-paraluman-heading)]">
                            {getInitials(item.name)}
                          </span>
                          <div>
                            <p className="[font-family:var(--font-paraluman-heading)] text-base font-black uppercase tracking-[0.01em] text-[#0f2f54]">
                              {item.name}
                            </p>
                            <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.1em] text-[#5b7f9f]">
                              {item.role}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex w-fit rounded-full border border-[#d7e7f6] bg-[#f1f7fd] px-3 py-1 [font-family:var(--font-paraluman-mono)] text-[9px] font-bold uppercase tracking-[0.14em] text-[#2f628f]">
                        {tag}
                      </span>
                      <p className="text-[#365a7a] [font-family:var(--font-paraluman-body)] text-base leading-8">
                        "{renderHighlightedQuote(item.quote, highlight)}"
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </RevealBlock>
          </SectionInner>
        </SectionShell>

        <SectionShell className="overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#e5f1fb_42%,#d7eafb_100%)] py-12 sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(127,192,255,0.24),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(23,63,105,0.12),transparent_24%)]" />
          <div className="pointer-events-none absolute left-[14%] top-8 h-44 w-44 rounded-full bg-[#6fb7ff]/16 blur-3xl" />
          <div className="pointer-events-none absolute right-[8%] bottom-8 h-44 w-44 rounded-full bg-[#1f6298]/12 blur-3xl" />
          <SectionInner className="relative space-y-24">
            <RevealBlock
              inView={sectionRevealMotion}
              className="flex flex-col items-center space-y-5 text-center"
            >
              <p className="[font-family:var(--font-paraluman-heading)] bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_22%,#eef7ff_36%,#2574BB_50%,#6fb7ff_64%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(3rem,6.2vw,5.8rem)] font-black leading-[0.88] tracking-[-0.068em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] [filter:drop-shadow(0_10px_28px_rgba(37,116,187,0.18))]">
                Better internships start here.
              </p>
              <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.13em] text-[#1d5588] sm:text-xs">
                No resume needed &middot; 24h response &middot; Real product
                work
              </p>
            </RevealBlock>
            <InsetPanel className="overflow-hidden rounded-[0.33em] border border-[#2574BB]/14  shadow-[0_28px_66px_-42px_rgba(23,63,105,0.3)] backdrop-blur-sm">
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
                      href="/student/super-listing/cebu-pacific"
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
                      href="/student/super-listing/cebu-pacific"
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
                      href="/student/super-listing/cebu-pacific"
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
      </section>
    </main>
  );
}
