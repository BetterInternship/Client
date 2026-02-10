"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import miroIcon from "./miro-icon.svg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { HeaderTitle } from "@/components/shared/header";
import { InteractiveGridPattern } from "@/components/landingStudent/sections/1stSection/interactive-grid-pattern";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Laptop,
  Trophy,
  Users,
  Video,
} from "lucide-react";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
};

function getCountdown(targetDate: Date): Countdown {
  const now = new Date().getTime();
  const diff = targetDate.getTime() - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isOver: false };
}

function CountdownBlock({
  label,
  value,
}: {
  label: string;
  value: number;
  accent?: "blue" | "yellow" | "red" | "neutral";
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-black">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-black/40">
        {label}
      </p>
    </div>
  );
}

/* Magnetic Button Component */
function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const max = 6;
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

export default function MiroThonLandingPage() {
  const discordLink = "https://discord.gg/QZ9mXJQm";
  const eventPage = "https://betterinternship.ph/miro";

  const eventStart = useMemo(() => new Date("2026-02-13T18:00:00+08:00"), []);
  const eventEnd = useMemo(() => new Date("2026-02-14T23:59:00+08:00"), []);

  const [countdown, setCountdown] = useState<Countdown>(
    getCountdown(eventStart),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(eventStart));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventStart]);

  function openDiscord() {
    window.open(discordLink, "_blank");
  }

  return (
    <div className="min-h-screen text-black">
      {/* texture */}
      <div className="pointer-events-none fixed inset-0 -z-20" aria-hidden>
        <InteractiveGridPattern
          width={36}
          height={36}
          squares={[60, 40]}
          className="h-full w-full opacity-30 [mask-image:radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
          squaresClassName="border border-gray-200/10"
        />
      </div>

      {/* orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <span className="absolute -top-16 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/25 to-blue-400/20 blur-xl sm:blur-3xl" />
        <span className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-gradient-to-br from-primary/25 to-blue-400/20 blur-xl sm:blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4">
        <HeaderTitle />
        <Button
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-500"
          onClick={openDiscord}
        >
          Join the Miro-thon!
        </Button>
      </header>

      {/* HERO */}
      <section className="relative isolate w-full min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 text-center pb-6 sm:pb-10">
        {/* Hero Section Background */}
        <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
          <InteractiveGridPattern
            width={36}
            height={36}
            squares={[60, 40]}
            className="h-full w-full opacity-30 [mask-image:radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
            squaresClassName="border border-gray-200/10"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex w-full flex-col items-center gap-4 sm:gap-6"
        >
          {/* LOGO SECTION - BIGGER */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Image
              src="/BetterInternshipLogo.png"
              alt="BetterInternship"
              width={40}
              height={40}
              className="h-10 w-10 sm:h-16 sm:w-16"
            />
            <span className="text-xl sm:text-2xl font-black text-black/30">
              ×
            </span>
            <Image
              src={miroIcon}
              alt="Miro"
              width={40}
              height={40}
              className="h-10 w-10 sm:h-16 sm:w-16"
            />
          </div>

          {/* HEADLINE WITH INLINE LOGO */}
          <div className="max-w-5xl relative">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight relative">
              Fight for an internship at{" "}
              <span
                className="inline-flex items-center gap-1 sm:gap-2 align-middle"
                style={{ color: "#ffdc33" }}
              >
                <Image
                  src={miroIcon}
                  alt="Miro"
                  width={80}
                  height={80}
                  className="h-[0.85em] w-[0.85em] inline-block align-middle"
                />
                Miro
              </span>
            </h1>
            {/* Sticky Note - Desktop: positioned bottom-right, Mobile: below */}
            <motion.div
              className="relative sm:absolute sm:top-[11rem] sm:right-[13rem] sm:translate-y-1/3 mt-2 sm:mt-0 flex justify-center sm:justify-end"
              style={{ rotate: "-3deg" }}
              animate={{ rotate: [-3, 1, -2] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <span
                className="inline-block text-black/60 text-lg sm:text-xl md:text-2xl bg-yellow-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg"
                style={{
                  boxShadow:
                    "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                }}
              >
                (yes, that Miro)
              </span>
            </motion.div>
          </div>

          {/* COUNTDOWN - RIGHT UNDER HEADLINE */}
          <div className="mt-4 sm:mt-8 flex w-full max-w-full items-center justify-center gap-1 sm:gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-2">
            <CountdownBlock label="Days" value={countdown.days} />
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-black/20 flex-shrink-0">
              :
            </div>
            <CountdownBlock label="Hours" value={countdown.hours} />
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-black/20 flex-shrink-0">
              :
            </div>
            <CountdownBlock label="Mins" value={countdown.minutes} />
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-black/20 flex-shrink-0">
              :
            </div>
            <CountdownBlock label="Secs" value={countdown.seconds} />
          </div>

          {/* DESCRIPTION */}
          <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-black/70">
            Can you build something in 30 hours that will impress Miro?
          </p>

          {/* CTA BUTTONS */}
          <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3 sm:flex-row">
            <MagneticButton className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full h-14 bg-blue-600 text-lg font-bold text-white hover:bg-blue-500"
                onClick={openDiscord}
              >
                Join the Miro-thon!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* DETAILS */}
      <section id="details" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="group relative rounded-[0.33em] border border-gray-200  p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden ">
              <div className="relative flex items-center gap-4">
                <h3 className="text-3xl md:text-4xl font-black text-black">
                  When
                </h3>
              </div>
              <p className="relative mt-6 text-base text-gray-700 font-semibold">
                Feb 13 (Thu) 6:00 PM → Feb 14 (Fri) 11:59 PM
              </p>
              <p className="mt-2 text-sm text-gray-500">30 hours total.</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="group relative rounded-[0.33em] border border-gray-200  p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden ">
              <div className="relative flex items-center gap-4">
                <h3 className="text-3xl md:text-4xl font-black text-black">
                  Where
                </h3>
              </div>
              <p className="relative mt-6 text-base text-gray-700 font-semibold">
                Online.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Join our{" "}
                <a
                  href="https://discord.gg/QZ9mXJQm"
                  className="text-blue-500 hover:underline transition-all duration-200"
                  target="_blank"
                >
                  Discord
                </a>{" "}
                for updates.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="group relative rounded-[0.33em] border border-gray-200  p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden ">
              <div className="relative flex items-center gap-4">
                <h3 className="text-3xl md:text-4xl font-black text-black">
                  Who can join
                </h3>
              </div>
              <p className="relative mt-6 text-base text-gray-700 font-semibold">
                Anyone.
              </p>
              <p className="mt-2 text-sm text-gray-500">Any school. Any age.</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="group relative rounded-[0.33em] border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden">
              <div className="relative flex items-center gap-4">
                <h3 className="text-3xl md:text-4xl font-black text-black">
                  What's at stake
                </h3>
              </div>
              <p className="relative mt-6 text-base text-gray-700 font-semibold">
                An internship opportunity at Miro
              </p>
              <p className="mt-2 text-sm text-gray-500">
                (and maybe become a full time hire)
              </p>
            </Card>
          </motion.div>
        </div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="group relative rounded-[0.33em] border border-gray-200  p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden">
            <div className="relative flex items-center gap-4">
              <h3 className="text-3xl md:text-4xl font-black text-black">
                Submission Requirements
              </h3>
            </div>

            <ul className="relative mt-6 space-y-2 text-gray-700 font-medium">
              <li>• Submit a public link/prototype/file</li>
              <li>• A 60-second demo video</li>
              <li>• Team info included if applicable</li>
            </ul>

            <p className="relative mt-6 text-sm text-gray-500">
              Done is better than perfect. Just ship something.
            </p>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
