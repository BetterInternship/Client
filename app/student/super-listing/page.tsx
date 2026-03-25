"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Target } from "lucide-react";
import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { InteractiveGridPattern } from "@/components/landingStudent/sections/1stSection/interactive-grid-pattern";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SuperListingBadge } from "@/components/shared/jobs";
import { cn } from "@/lib/utils";

function SectionReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

type SuperListingBadgeSize = "body" | "heading" | "button";

const superListingBadgeSizeClasses: Record<SuperListingBadgeSize, string> = {
  body: "mx-1 align-middle",
  heading: "mx-2 align-middle text-[0.38em] px-[0.72em] py-[0.38em]",
  button: "mx-2 align-middle text-[0.75em] px-[0.72em] py-[0.32em] text-black",
};

function renderTextWithSuperListingBadge(
  text: string,
  size: SuperListingBadgeSize = "body",
): React.ReactNode {
  const parts = text.split(/(Super Listings|Super Listing)/g);

  return parts.map((part, index) => {
    if (part === "Super Listings" || part === "Super Listing") {
      return (
        <SuperListingBadge
          key={`sl-badge-${index}`}
          compact
          className={cn(superListingBadgeSizeClasses[size])}
        />
      );
    }

    return <span key={`sl-text-${index}`}>{part}</span>;
  });
}

/* ---------- Magnetic CTA Button ---------- */
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

export default function SuperListingStoryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.1,
  });

  // Parallax values
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0.15, 0.35], [1, 0.7]);

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-x-hidden scroll-smooth bg-white text-black"
    >
      {/* Grid pattern background */}
      <div className="pointer-events-none fixed inset-0 -z-20" aria-hidden>
        <InteractiveGridPattern
          width={36}
          height={36}
          squares={[60, 40]}
          className="h-full w-full opacity-20 [mask-image:radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
          squaresClassName="border border-gray-300/10"
        />
      </div>

      {/* Animated orbs - brand colors */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <motion.span
          className="absolute -top-16 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/15 to-blue-400/10 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-300/10 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-[9999] flex items-center justify-between px-6 pb-2 pt-4 sm:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-70"
          >
            <Image
              src="/BetterInternshipLogo.png"
              alt="BetterInternship"
              width={40}
              height={40}
              className="h-10 w-10 sm:h-12 sm:w-12"
            />
            <span className="text-base font-black tracking-tight text-black sm:text-lg">
              BetterInternship
            </span>
          </Link>
        </div>
      </header>

      {/* Scroll Progress Bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed left-0 right-0 top-0 z-50 h-1.5 origin-left bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
      />

      {/* Hero Section with Parallax */}
      <motion.section
        style={{
          y: heroY,
          scale: heroScale,
          opacity: heroOpacity,
        }}
        className="relative min-h-screen flex items-center justify-center overflow-visible pt-[calc(env(safe-area-inset-top)+1rem)] sm:pt-10"
      >
        {/* Lightning Icons - Top Left */}
        <motion.div
          className="absolute top-1/4 left-4 sm:left-12 text-amber-400/70 pointer-events-none"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Zap className="w-12 h-12 sm:w-16 sm:h-16 filter drop-shadow-lg" />
        </motion.div>

        {/* Lightning Icons - Top Right */}
        <motion.div
          className="absolute top-1/3 right-4 sm:right-12 text-amber-400/70 pointer-events-none"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        >
          <Zap className="w-10 h-10 sm:w-14 sm:h-14 filter drop-shadow-lg" />
        </motion.div>

        {/* Lightning Icons - Bottom Left */}
        <motion.div
          className="absolute bottom-1/4 left-8 sm:left-20 text-amber-400/60 pointer-events-none"
          animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        >
          <Zap className="w-8 h-8 sm:w-12 sm:h-12 filter drop-shadow-lg" />
        </motion.div>

        {/* Lightning Icons - Bottom Right */}
        <motion.div
          className="absolute bottom-1/3 right-8 sm:right-20 text-amber-400/60 pointer-events-none"
          animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
        >
          <Zap className="w-8 h-8 sm:w-12 sm:h-12 filter drop-shadow-lg" />
        </motion.div>

        {/* Animated background gradient */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-200/20 blur-3xl"
            animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-purple-200/20 blur-3xl"
            animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-black uppercase tracking-widest text-amber-600 mb-6 drop-shadow-lg"
            >
              ✨ The Future of Hiring
            </motion.p>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-tight tracking-tighter mb-6 drop-shadow-xl [text-shadow:_0_4px_20px_rgba(255,215,0,0.4)]">
              Talent
              <br />
              <span style={{ color: "#FFD700" }}>Doesn't Always</span>
              <br />
              Wear a Resume
            </h1>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed font-mono font-semibold">
              The best builders are filtered out before they get a real chance.{" "}
              {renderTextWithSuperListingBadge(
                "With Super Listings, capability matters. Execution wins. You win.",
              )}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <MagneticButton className="inline-block">
                <Link href="/student/search">
                  <Button className="h-14 rounded-[0.33em] border-2 border-black bg-black px-8 text-lg font-black text-white hover:bg-black/80 shadow-2xl transition-all duration-300">
                    Explore
                    <SuperListingBadge
                      compact
                      className={superListingBadgeSizeClasses.button}
                    />
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-gray-400"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.section>

      {/* The Problem */}
      <SectionReveal className="relative py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-sm font-black uppercase tracking-widest text-amber-600 mb-3">
              THE PROBLEM
            </p>
            <h2 className="text-4xl sm:text-6xl font-black mb-6">
              What's Broken
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🚫",
                title: "Filtered Too Early",
                desc: "Great builders get rejected before showing what they can do.",
              },
              {
                icon: "📄",
                title: "Resume-First",
                desc: "Credentials matter more than actual capability and execution.",
              },
              {
                icon: "⏰",
                title: "Slow Process",
                desc: "Hiring takes forever. Talent gets hired by someone else.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-15" />
                <div className="relative p-6 rounded-[0.33em] border-2 border-red-200 bg-red-50/40 hover:border-red-300 transition-all">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-700 font-mono text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* The Journey */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-sm font-black uppercase tracking-widest text-amber-600 mb-3">
              OUR JOURNEY
            </p>
            <h2 className="text-4xl sm:text-6xl font-black mb-4">
              How We Got Here
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                phase: "Phase One",
                year: "2025",
                title: "Miro Changed Everything",
                story:
                  "One internship listing at Miro showed us something remarkable. A single opportunity unlocked momentum. We realized—builders don't need perfect resumes. They need one real shot.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                phase: "Phase Two",
                year: "2026",
                title: "FFF Proved It",
                story:
                  "Founders for Founders proved our thesis. High-signal talent doesn't need fancy credentials. They need the right challenge and stage. We found the builders who move fast.",
                color: "from-purple-500 to-pink-500",
              },
              {
                phase: "Phase Three",
                year: "Now",
                title: "Super Listings: Built Different",
                story:
                  "We built the system. Super Listings fast-track talent by proving capability through challenges, not pedigree. It's how builders become visible. It's how teams find their next star.",
                color: "from-amber-400 to-amber-600",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex items-start gap-6"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-1 shadow-lg`}
                >
                  {item.year}
                </div>
                <div className="pt-1">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
                    {item.phase}
                  </p>
                  <h3 className="text-2xl font-black mb-3">
                    {renderTextWithSuperListingBadge(item.title)}
                  </h3>
                  <p className="text-gray-700 leading-relaxed max-w-2xl font-mono text-sm">
                    {renderTextWithSuperListingBadge(item.story)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What is a Super Listing */}
      <section className="relative py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-black uppercase tracking-widest text-amber-600 mb-3">
              CORE CONCEPT
            </p>
            <h2 className="text-4xl sm:text-6xl font-black mb-6">
              What IS a{" "}
              <SuperListingBadge
                compact
                className={superListingBadgeSizeClasses.heading}
              />
              ?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-mono">
              A new way to hire. One that puts capability first. Signal beats
              prestige.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 mb-12">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "For Students",
                subtitle: "Prove what you can do",
                lines: [
                  "Show execution, not credentials",
                  "Build something real for a real team",
                  "Get evaluated on capability",
                  "Fast-track to companies that ship",
                ],
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "For Founders",
                subtitle: "Find builders faster",
                lines: [
                  "Discover talent before resume-grind",
                  "See what people can actually build",
                  "Hire the hunters, not the hunted",
                  "Build teams of people who ship",
                ],
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative"
              >
                <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-10" />
                <Card className="relative p-8 rounded-[0.33em] border-2 border-gray-200 bg-white hover:border-amber-300 transition-all duration-300">
                  <div className="text-amber-600 mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-black mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 mb-6 font-mono uppercase tracking-widest">
                    {item.subtitle}
                  </p>
                  <ul className="space-y-3">
                    {item.lines.map((line, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="text-amber-600 font-black mt-1">
                          →
                        </span>
                        <span className="text-gray-700 font-mono text-sm">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Core principles */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="pointer-events-none absolute inset-0 translate-x-[8px] translate-y-[8px] bg-[repeating-linear-gradient(135deg,rgba(217,119,6,0.3)_0_2px,transparent_2px_8px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-100" />
            <div className="relative rounded-[0.33em] bg-gradient-to-br from-amber-50 to-orange-50 p-12 border-2 border-amber-200">
              <h3 className="text-2xl font-black mb-8">
                The{" "}
                <SuperListingBadge
                  compact
                  className={superListingBadgeSizeClasses.heading}
                />{" "}
                Formula
              </h3>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  {
                    title: "Challenge First",
                    desc: "Evaluate by what you ship and explain, not your resume.",
                  },
                  {
                    title: "Speed Matters",
                    desc: "Teams commit to moving fast. We reject slow hiring.",
                  },
                  {
                    title: "Signal > Prestige",
                    desc: "Clear execution and insight beat limited experience.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <h4 className="font-black text-lg mb-2 text-amber-900">
                      {item.title}
                    </h4>
                    <p className="text-gray-700 font-mono text-sm">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative py-32 px-6 bg-black text-white overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-amber-500/30 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-amber-400/20 rounded-full"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-black uppercase tracking-widest text-amber-400 mb-4"
          >
            READY?
          </motion.p>

          <h2 className="text-5xl sm:text-7xl font-black mb-6">
            Show What
            <br />
            <span style={{ color: "#FFD700" }}>You Can Do</span>
          </h2>

          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-3xl mx-auto font-mono leading-relaxed">
            {renderTextWithSuperListingBadge(
              "Super Listings are for builders. People who ship. People who think differently. People who don't need a resume to prove their worth.",
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <MagneticButton>
              <Link href="/student/search">
                <Button className="h-14 rounded-[0.33em] border-2 border-white bg-white px-10 text-lg font-black text-black hover:bg-gray-100 transition-all">
                  Explore Listings
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </MagneticButton>

            <MagneticButton>
              <Link href="/student/fff">
                <Button className="h-14 rounded-[0.33em] border-2 border-amber-400 bg-transparent px-10 text-lg font-black text-amber-400 hover:bg-amber-400/10 transition-all">
                  FFF Challenge
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </MagneticButton>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/40 text-sm font-mono"
          >
            ✨ You're at the story's end. Now go write your own.
          </motion.p>
        </div>
      </motion.section>
    </main>
  );
}
