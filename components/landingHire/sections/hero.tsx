"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import MagneticButton from "@/components/ui/magnetic-button";
import Link from "next/link";
import { easeOut, motion, useReducedMotion, Variants } from "framer-motion";
import { useBlurTransition } from "@/components/animata/blur";
import { InteractiveGridPattern } from "@/components/landingStudent/sections/1stSection/interactive-grid-pattern";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const line: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 18,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.45, ease: easeOut },
    },
  };

  const blurTransition = useBlurTransition();

  return (
    <section className="relative min-h-screen flex justify-center items-center overflow-hidden px-8 bg-gradient-to-t from-primary/0 to-primary/10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <InteractiveGridPattern
          width={36}
          height={36}
          squares={[60, 40]}
          className="h-full w-full opacity-30 [mask-image:radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
          squaresClassName="border border-gray-200/10"
        />
      </div>
      <div className="flex w-full max-w-7xl flex-col gap-8 md:flex-row items-center">
        <div className="flex flex-col gap-2 md:w-1/2">
          <motion.img
            src="/BetterInternshipLogo.png"
            className="w-24 h-24 flex-shrink-0 aspect-square object-contain"
            alt="BetterInternship logo"
            {...blurTransition}
          ></motion.img>
          <div className="flex flex-col">
            <motion.h1
              className="tracking-tighter font-bold leading-none"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.span variants={line} className="block">
                Hire interns
              </motion.span>
              <motion.span variants={line} className="block">
                Faster
              </motion.span>
              <motion.span variants={line} className="block">
                Easier
              </motion.span>
              <motion.span variants={line} className="block text-primary">
                Better.
              </motion.span>
            </motion.h1>
          </div>
          <motion.p {...blurTransition} className="text-lg max-w-[90%]">
            Minimize your paperwork and automate your workflow on
            BetterInternship.
          </motion.p>
          <motion.div
            {...blurTransition}
            className="mt-4 flex flex-col md:flex-row gap-8 md:items-center"
          >
            <MagneticButton className="w-fit">
              <Link href="/register">
                <Button
                  type="button"
                  variant="ghost"
                  className="bg-primary text-primary-foreground px-16 h-14 w-fit hover:shadow-2xl hover:shadow-primary/50 hover:bg-primary/90 hover:text-primary-foreground transition-all"
                >
                  Post a job now
                  <ArrowRight />
                </Button>
              </Link>
            </MagneticButton>
            <Link href={process.env.NEXT_PUBLIC_CLIENT_URL ?? "/student"}>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
              >
                For students
                <ChevronRight />
              </Button>
            </Link>
          </motion.div>
        </div>
        <motion.div
          {...blurTransition}
          className="hidden lg:block lg:w-1/2 relative aspect-[4/3] w-full overflow-hidden rounded-[0.33em]"
        >
          <Image
            src="/hire-landing-hero.jpg"
            alt="Interns collaborating in a modern office"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
