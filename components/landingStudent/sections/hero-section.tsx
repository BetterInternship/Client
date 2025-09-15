"use client";

import { motion, Variants, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LogoCarouselBasic } from "@/components/landingStudent/sections/5thSection/sectionpage";
import { InteractiveGridPattern } from "@/components/landingStudent/sections/1stSection/interactive-grid-pattern";
import { Navigation } from "@/components/landingStudent/navigation";
import { DoodleUnderline } from "@/components/landingStudent/ui/doodle-underline";

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

export function HeroSection() {
  return (
    <div className="relative isolate w-full overflow-hidden">
      {/* texture */}
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
        <InteractiveGridPattern
          width={36}
          height={36}
          squares={[60, 40]}
          className="h-full w-full opacity-30 [mask-image:radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
          squaresClassName="border border-gray-200/10"
        />
      </div>

      {/* orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <span className="absolute -top-16 -left-20 h-72 w-72 rounded-full
          bg-gradient-to-br from-primary/25 to-blue-400/20 blur-xl sm:blur-3xl" />
        <span className="absolute -right-24 bottom-20 h-80 w-80 rounded-full
          bg-gradient-to-br from-primary/25 to-blue-400/20 blur-xl sm:blur-3xl" />
      </div>

      {/* navigation */}
      <div className="absolute inset-x-0 top-0 z-40">
        <Navigation />
      </div>

      <section
        aria-labelledby="hero-heading"
        className="
          relative min-h-[100svh]
          pt-[calc(env(safe-area-inset-top)+5rem)] [@media_(max-width:390px)]:pt-[calc(env(safe-area-inset-top)+5.75rem)] sm:pt-6
          flex flex-col items-center justify-center text-center
          gap-8 sm:gap-6
          px-4 sm:px-6
        "
      >
        <AirplanePath />

        {/* pill */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="
            inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white
            px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm
            sm:px-3 sm:py-2 sm:text-xs
            mt-2 sm:mt-0
          "
        >
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary sm:h-2 sm:w-2" />
          <span>One profile. One click.</span>
        </motion.div>

        {/* heading with scribble underline */}
        <motion.h1
          id="hero-heading"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="
            relative text-5xl sm:text-7xl md:text-8xl
            font-medium tracking-tighter leading-[1.05] text-black/80
          "
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

            {/* logos */}
            <div className="overflow-x-auto no-scrollbar mt-10">
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
