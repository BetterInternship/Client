"use client";

import { motion, Variants, useReducedMotion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,

} from "lucide-react";
import { LogoCarouselBasic } from "@/components/landingStudent/sections/5thSection/sectionpage";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { CheckCircle2 } from "lucide-react";
import { Navigation } from "@/components/landingStudent/navigation";

const HIRE_URL = process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ?? "/hire";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};
const fadeUpDelayed: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.2 },
  },
};

/* ---------- Magnetic CTA ---------- */
function MagneticButton({
  children,
  className = "",
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const prefersReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const max = 6; // px
  function onMove(e: React.MouseEvent) {
    if (prefersReduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTx(x * max * 2);
    setTy(y * max * 2);
  }
  function onLeave() {
    setTx(0);
    setTy(0);
  }

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

/* ---------- Scribble underline ---------- */
function DoodleUnderline({ className = "" }: { className?: string }) {
  const prefersReduce = useReducedMotion();
  return (
    <svg
      className={`absolute -bottom-2 left-0 right-0 h-3 w-full ${className}`}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M2 7 C 20 1, 40 11, 60 3 S 95 9, 98 5"
        fill="none"
        stroke="url(#g)"
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: prefersReduce ? 1 : 1 }}
        transition={{ duration: prefersReduce ? 0 : 1.2, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(220 90% 60% / 0.5)" />
          <stop offset="50%" stopColor="hsl(220 90% 55% / 0.8)" />
          <stop offset="100%" stopColor="hsl(220 90% 60% / 0.5)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---------- Paper airplane path ---------- */
function AirplanePath() {
  const prefersReduce = useReducedMotion();
  return (
    <svg
      className="pointer-events-none absolute -z-10 left-1/2 top-[18%] h-[120px] w-[min(90%,760px)] -translate-x-1/2 opacity-40"
      viewBox="0 0 760 120"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M10 90 C 140 40, 300 120, 420 70 S 640 20, 750 60"
        stroke="currentColor"
        className="text-gray-300"
        strokeWidth="2"
        strokeDasharray="6 10"
        animate={prefersReduce ? undefined : { strokeDashoffset: [0, 200] }}
        transition={
          prefersReduce
            ? undefined
            : { duration: 6, repeat: Infinity, ease: "linear" }
        }
      />
      {/* tiny airplane tip */}
      <polygon
        points="0,0 14,6 0,12 4,6"
        className="fill-gray-400"
        transform="translate(742,57) rotate(10)"
      />
    </svg>
  );
}

/* ================================================ */

export function HeroSection() {
  return (
    <div className="relative isolate w-full overflow-hidden">
      {/* texture */}
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
        <InteractiveGridPattern
          width={36}
          height={36}
          squares={[60, 40]}
          className="h-full w-full opacity-15 [mask-image:radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
          squaresClassName="border border-gray-200/50"
        />
      </div>

      {/* orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <span className="absolute -top-16 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/25 to-blue-400/20 blur-3xl" />
        <span className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-fuchsia-300/25 to-amber-200/25 blur-3xl" />
      </div>

      {/* Navigation */}
      <div className="absolute inset-x-0 top-0 z-40">
        <Navigation />
      </div>

      <section
        aria-labelledby="hero-heading"
        className="relative min-h-[100svh] pt-6 flex flex-col items-center justify-center text-center gap-6 px-4 sm:px-6"
      >
        {/* paper airplane path behind heading */}
        <AirplanePath />

        {/* pill */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          <span>One profile. One click.</span>
        </motion.div>

        {/* heading with scribble underline */}
        <motion.h1
          id="hero-heading"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative text-4xl sm:text-7xl md:text-8xl font-medium tracking-tighter leading-tight text-black/80"
        >
          Land an{" "}
          <span className="relative inline-block">
            internship
            <DoodleUnderline />
          </span>
          . <br />
          <AnimatedShinyText>10x faster.</AnimatedShinyText>
        </motion.h1>

        {/* CTAs */}
        <div className="mt-2 w-full sm:max-w-[36rem] md:max-w-3xl">
          <motion.div
            variants={fadeUpDelayed}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center justify-center gap-6"
          >
            <div className="flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <MagneticButton className="w-full sm:w-auto">
                <Link href="/search" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-[0.33em] border border-gray-300 bg-white px-8 py-4 text-lg tracking-tight text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    Find Internships
                  </Button>
                </Link>
              </MagneticButton>

              <Link href={HIRE_URL} className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex w-full items-center justify-center text-lg font-medium text-gray-900 hover:bg-gray-100 sm:w-auto sm:justify-start"
                >
                  <ChevronRight className="mr-1" />
                  For Employers
                </Button>
              </Link>
            </div>

            {/* Steps */}
            <ul className="mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600 mt-8">
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Auto-fill paperwork
              </li>
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                One-click apply
              </li>
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                MOA-ready docs
              </li>
            </ul>

            {/* logos */}
            <div className="overflow-x-auto no-scrollbar">
              <LogoCarouselBasic />
            </div>
          </motion.div>
        </div>

        {/* scroll hint */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center text-gray-400 sm:bottom-8 sm:flex"
          aria-hidden="true"
        >
          <svg
            className="h-6 w-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}
