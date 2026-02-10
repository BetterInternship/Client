"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import miroIcon from "./miro-icon.svg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeaderTitle } from "@/components/shared/header";
import { InteractiveGridPattern } from "@/components/landingStudent/sections/1stSection/interactive-grid-pattern";
import { ArrowRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-black font-mono">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-black/40 font-mono">
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

/* Remote Cursor Component */
interface RemoteCursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
}

function RemoteCursor({ x, y, name, color }: RemoteCursorProps) {
  return (
    <motion.div
      className="pointer-events-none absolute z-50"
      initial={{ x, y }}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 70, damping: 25 }}
    >
      <svg
        width="24"
        height="32"
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M5.65 1.65L23.39 17.35L14.77 19.38L13.73 27.5L9.54 24.35L5.65 1.65Z"
          fill={color}
        />
      </svg>
      <div
        className="absolute top-7 left-2 px-2 py-1 rounded text-xs font-bold text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </motion.div>
  );
}

/* Animated Cursors Demo */
function RemoteCursorsDemo() {
  // Helper to generate random duration
  const randomDuration = () => Math.random() * 2 + 2; // 2-4 seconds

  // Helper to generate random position within bounds (0-100 percentage scale)
  const randomPos = (
    minXPercent: number,
    maxXPercent: number,
    minYPercent: number,
    maxYPercent: number,
  ) => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1920;
    const height = typeof window !== "undefined" ? window.innerHeight : 1080;

    return {
      x:
        (Math.random() * (maxXPercent - minXPercent) + minXPercent) *
        (width / 100),
      y:
        (Math.random() * (maxYPercent - minYPercent) + minYPercent) *
        (height / 100),
      duration: randomDuration(),
    };
  };

  const cursorData = [
    {
      name: "Jana",
      color: "#FF1744",
      path: [
        randomPos(15, 30, 5, 20),
        randomPos(15, 30, 5, 20),
        randomPos(15, 30, 5, 20),
        randomPos(15, 30, 5, 20),
        randomPos(15, 30, 5, 20),
      ],
    },
    {
      name: "Mo",
      color: "#00E676",
      path: [
        randomPos(85, 94, 5, 20),
        randomPos(85, 94, 5, 20),
        randomPos(85, 94, 5, 20),
        randomPos(85, 94, 5, 20),
        randomPos(85, 94, 5, 20),
      ],
    },
    {
      name: "Sherwin",
      color: "#1E88E5",
      path: [
        randomPos(0, 15, 80, 100),
        randomPos(0, 15, 80, 100),
        randomPos(0, 15, 80, 100),
        randomPos(0, 15, 80, 100),
        randomPos(0, 15, 80, 100),
      ],
    },
    {
      name: "Paul",
      color: "#D500F9",
      path: [
        randomPos(80, 94, 130, 150),
        randomPos(80, 94, 130, 150),
        randomPos(80, 94, 130, 150),
        randomPos(80, 94, 130, 150),
        randomPos(80, 94, 130, 150),
        randomPos(80, 94, 130, 150),
      ],
    },
    {
      name: "Jay",
      color: "#D3869B",
      path: [
        randomPos(40, 60, 180, 200),
        randomPos(40, 60, 180, 200),
        randomPos(40, 60, 180, 200),
        randomPos(40, 60, 180, 200),
        randomPos(40, 60, 180, 200),
      ],
    },
    {
      name: "Erin",
      color: "#FF6D00",
      path: [
        randomPos(0, 15, 120, 140),
        randomPos(0, 15, 120, 140),
        randomPos(0, 15, 120, 140),
        randomPos(0, 15, 120, 140),
        randomPos(0, 15, 120, 140),
      ],
    },
    {
      name: "Bowei",
      color: "#00D4FF",
      path: [
        randomPos(70, 85, 60, 80),
        randomPos(70, 85, 60, 80),
        randomPos(70, 85, 60, 80),
        randomPos(70, 85, 60, 80),
        randomPos(70, 85, 60, 80),
      ],
    },
  ];

  const [positions, setPositions] = useState(
    cursorData.map((cursor) => cursor.path[0]),
  );

  useEffect(() => {
    const intervals = cursorData.map((cursor, idx) => {
      let pathIndex = 0;

      const moveToNextPoint = () => {
        const point = cursor.path[pathIndex];
        setPositions((prev) => {
          const newPos = [...prev];
          newPos[idx] = { x: point.x, y: point.y };
          return newPos;
        });

        pathIndex = (pathIndex + 1) % cursor.path.length;
      };

      moveToNextPoint();
      return setInterval(
        moveToNextPoint,
        (cursor.path[0]?.duration || 3) * 1000,
      );
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 hidden lg:block">
      {cursorData.map((cursor, idx) => (
        <RemoteCursor
          key={cursor.name}
          x={positions[idx]?.x || 0}
          y={positions[idx]?.y || 0}
          name={cursor.name}
          color={cursor.color}
        />
      ))}
    </div>
  );
}

export default function MiroThonLandingPage() {
  const discordLink = "https://discord.gg/QZ9mXJQm";

  const eventStart = useMemo(() => new Date("2026-02-13T18:00:00+08:00"), []);
  const eventEnd = useMemo(() => new Date("2026-02-14T23:59:00+08:00"), []);

  const [countdown, setCountdown] = useState<Countdown>(
    getCountdown(eventStart),
  );

  const [isEventLive, setIsEventLive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const isLive = now >= eventStart.getTime() && now < eventEnd.getTime();
      setIsEventLive(isLive);
      // Show countdown to event end when live, otherwise countdown to event start
      setCountdown(getCountdown(isLive ? eventEnd : eventStart));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventStart, eventEnd]);

  function openDiscord() {
    window.open(discordLink, "_blank");
  }

  return (
    <div className="min-h-screen text-black overflow-x-hidden">
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
      <header className="sticky top-0 flex items-center justify-between px-6 pt-4 z-[9999] bg-white/20 backdrop-blur-sm">
        {/* LOGO SECTION - BIGGER */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/BetterInternshipLogo.png"
            alt="BetterInternship"
            width={40}
            height={40}
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <span className="text-xl sm:text-2xl font-black text-black/30">
            ×
          </span>
          <Image
            src={miroIcon}
            alt="Miro"
            width={40}
            height={40}
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
        </div>
      </header>

      {/* HERO */}
      <section className="relative w-full min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 text-center pb-6 sm:pb-10 z-10">
        {/* Animated Collaborative Cursors Demo - Hero Section */}
        <RemoteCursorsDemo />

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
          {/* HEADLINE WITH INLINE LOGO */}
          <div className="max-w-5xl relative">
            {isEventLive ? (
              <>
                <div
                  className="inline-block mb-6 border border-red-600 rounded-full px-6 py-3 bg-red-100"
                  style={{
                    animation:
                      "pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }}
                >
                  <span className="text-red-600 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                    <Circle className="h-5 w-5 fill-white -mt-0.5" />
                    Live NOW
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight relative text-red-600">
                  The Miro-thon is happening NOW!
                </h1>
              </>
            ) : (
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight relative">
                Fight for an internship at{" "}
                <a
                  href="https://miro.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 sm:gap-2 align-middle hover:brightness-90 transition-all duration-200 -mt-2"
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
                </a>
              </h1>
            )}
            {/* Sticky Note - Desktop: positioned bottom-right, Mobile: below */}
            <motion.div
              className={`relative sm:absolute mt-2 sm:mt-0 flex justify-center sm:justify-end ${isEventLive ? "sm:top-[15.5rem] sm:right-[5rem] sm:translate-y-1/3" : "sm:top-[11rem] sm:right-[13rem] sm:translate-y-1/3"}`}
              style={{ rotate: "-3deg" }}
              animate={{ rotate: [-3, 1, -2] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {!isEventLive && (
                <span
                  className="inline-block text-black/60 text-lg sm:text-xl md:text-2xl bg-yellow-100 px-3 py-1 sm:px-4 sm:py-2 rounded-[0.33em] shadow-lg"
                  style={{
                    boxShadow:
                      "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  (yes, that{" "}
                  <a
                    href="https://miro.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline transition-all duration-200"
                  >
                    Miro
                  </a>
                  )
                </span>
              )}
            </motion.div>
          </div>

          {/* COUNTDOWN/COUNTDOWN TIMER */}
          <div className="mt-4 sm:mt-8 flex w-full max-w-full items-end justify-center gap-1 sm:gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-2">
            <CountdownBlock label="Days" value={countdown.days} />
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black/20 flex-shrink-0 mb-6">
              :
            </div>
            <CountdownBlock label="Hours" value={countdown.hours} />
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black/20 flex-shrink-0 mb-6">
              :
            </div>
            <CountdownBlock label="Mins" value={countdown.minutes} />
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black/20 flex-shrink-0 mb-6">
              :
            </div>
            <CountdownBlock label="Secs" value={countdown.seconds} />
          </div>

          {/* DESCRIPTION */}
          <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-black/70 font-mono">
            {isEventLive
              ? "Submit your work on Discord. Good luck!"
              : "Can you build something in 30 hours that will impress Miro?"}
          </p>

          {/* CTA BUTTONS */}
          <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3 sm:flex-row">
            <MagneticButton className="w-full sm:w-auto">
              <Button
                size="lg"
                className={`w-full h-14 text-lg font-bold bg-blue-600 text-white hover:bg-blue-500`}
                onClick={openDiscord}
              >
                {isEventLive ? "Join Discord" : "Join the Miro-thon!"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* DETAILS */}
      <section
        id="details"
        className="relative mx-auto w-full max-w-6xl px-6 pb-20 z-0"
      >
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
              <p className="relative mt-6 text-base text-gray-700 font-semibold font-mono">
                Feb 13 (Thu) 6:00 PM → Feb 14 (Fri) 11:59 PM
              </p>
              <p className="mt-2 text-sm text-gray-500 font-mono">
                30 hours total.
              </p>
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
              <p className="relative mt-6 text-base text-gray-700 font-semibold font-mono">
                Online.
              </p>
              <p className="mt-2 text-sm text-gray-500 font-mono">
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
              <p className="relative mt-6 text-base text-gray-700 font-semibold font-mono">
                Anyone.
              </p>
              <p className="mt-2 text-sm text-gray-500 font-mono">
                Current participants: DLSU, Ateneo, UP
              </p>
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
              <p className="relative mt-6 text-base text-gray-700 font-semibold font-mono">
                An internship opportunity at Miro
              </p>
              <p className="mt-2 text-sm text-gray-500 font-mono">
                (and maybe become a full time hire)
              </p>
            </Card>
          </motion.div>
        </div>

        <motion.div
          className="mt-6"
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

            <ul className="relative mt-6 space-y-2 text-gray-700 font-medium font-mono">
              <li>* Demo URL</li>
              <li>* Proof of work (eg. Figma, GitHub)</li>
              <li>* A 60-seconds pitch</li>
            </ul>

            <p className="relative mt-6 text-sm text-gray-500 font-mono">
              Done is better than perfect. Just ship something.
            </p>
          </Card>
        </motion.div>
      </section>

      {/* TIME IS TICKING / EVENT LIVE SECTION */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className={`relative overflow-hidden rounded-[0.33em] border p-8 sm:p-12 ${isEventLive ? "border-red-600 bg-red-950" : "border-gray-800 bg-black"}`}
          >
            {/* Gradient background effect */}
            <div
              className={`pointer-events-none absolute inset-0 ${isEventLive ? "bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10" : "bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10"}`}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              {/* Left: Title and Timer */}
              <div className="flex flex-col gap-4 lg:gap-6 flex-1 w-full md:w-auto md:items-start items-center md:text-left text-center">
                <div>
                  {isEventLive ? (
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                      The event is{" "}
                      <span className="text-red-400">LIVE NOW</span>
                    </h2>
                  ) : (
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                      Time is <span className="text-yellow-300">ticking</span>
                    </h2>
                  )}
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center md:justify-start gap-1 sm:gap-2 md:gap-3">
                  <div className="flex flex-col items-center">
                    <p
                      className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono ${isEventLive ? "text-red-400" : "text-white"}`}
                    >
                      {String(countdown.days).padStart(2, "0")}
                    </p>
                    <p
                      className={`mt-1 text-xs font-bold ${isEventLive ? "text-red-300/60" : "text-white/40"}`}
                    >
                      D
                    </p>
                  </div>
                  <p
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black -mt-2 ${isEventLive ? "text-red-600/50" : "text-white/50"}`}
                  >
                    :
                  </p>
                  <div className="flex flex-col items-center">
                    <p
                      className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono ${isEventLive ? "text-red-400" : "text-white"}`}
                    >
                      {String(countdown.hours).padStart(2, "0")}
                    </p>
                    <p
                      className={`mt-1 text-xs font-bold ${isEventLive ? "text-red-300/60" : "text-white/40"}`}
                    >
                      H
                    </p>
                  </div>
                  <p
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black -mt-2 ${isEventLive ? "text-red-600/50" : "text-white/50"}`}
                  >
                    :
                  </p>
                  <div className="flex flex-col items-center">
                    <p
                      className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono ${isEventLive ? "text-red-400" : "text-white"}`}
                    >
                      {String(countdown.minutes).padStart(2, "0")}
                    </p>
                    <p
                      className={`mt-1 text-xs font-bold ${isEventLive ? "text-red-300/60" : "text-white/40"}`}
                    >
                      M
                    </p>
                  </div>
                  <p
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black -mt-2 ${isEventLive ? "text-red-600/50" : "text-white/50"}`}
                  >
                    :
                  </p>
                  <div className="flex flex-col items-center">
                    <p
                      className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono ${isEventLive ? "text-red-400" : "text-white"}`}
                    >
                      {String(countdown.seconds).padStart(2, "0")}
                    </p>
                    <p
                      className={`mt-1 text-xs font-bold ${isEventLive ? "text-red-300/60" : "text-white/40"}`}
                    >
                      S
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: CTA Button */}
              <MagneticButton className="w-full md:w-auto">
                <Button
                  size="lg"
                  className={`w-full md:w-auto h-14 text-lg font-bold transition-colors duration-200 ${isEventLive ? "bg-red-600 text-white hover:bg-red-500" : "bg-yellow-400 text-black hover:bg-yellow-300"}`}
                  onClick={openDiscord}
                >
                  {isEventLive ? "View Submissions" : "Join Now"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
