"use client";

import { motion, Variants } from "framer-motion";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LogoCarouselBasic } from "@/components/landingStudent/sections/5thSection/sectionpage";

const HIRE_URL = process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ?? "/hire";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const fadeUpDelayed: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.2 },
  },
};

export function HeroSection() {
  return (
    <div className="relative isolate w-full overflow-hidden">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white/40" />

      <section
        aria-labelledby="hero-heading"
        className="relative min-h-[100svh] flex flex-col items-center justify-center text-center gap-5 px-4 sm:px-6"
      >
        {/* Pill */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span>One profile. One click.</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          id="hero-heading"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-4 text-4xl sm:text-7xl md:text-8xl font-medium tracking-tighter leading-tight text-black/80"
        >
          Land an internship. <br />
          <AnimatedShinyText>10x faster.</AnimatedShinyText>
        </motion.h1>

        {/* Body stack */}
        <div className="w-full sm:max-w-[36rem] md:max-w-3xl">
          <motion.div
            variants={fadeUpDelayed}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8 sm:gap-20"
          >
            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/search" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-[0.33em] border border-gray-300 bg-white px-8 py-4 text-lg tracking-tight text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  Find Internships
                </Button>
              </Link>

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

            {/* Companies carousel */}
            <div className="overflow-x-auto no-scrollbar">
              <LogoCarouselBasic />
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
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
