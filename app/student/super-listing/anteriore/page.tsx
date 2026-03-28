"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import anterioreLogo from "./logo.png";
import { SuperListingBadge } from "@/components/shared/jobs";
import { cn } from "@/lib/utils";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-anteriore-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-anteriore-mono",
});

const CHALLENGE_PDF_URL =
  "https://drive.google.com/file/d/1A7k32JC_jdpHV6vQpEtcFNH9UdwSZtVG/view?usp=sharing";
const ANTERIORE_SITE_URL = "https://anteriore.com.ph/";

export default function AnteriorePage() {
  const [isAtTop, setIsAtTop] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root) return;

    setIsAtTop(root.scrollTop <= 1);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtTop(entry.isIntersecting);
      },
      {
        root,
        threshold: 1,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hasChallengePdf = CHALLENGE_PDF_URL.trim().length > 0;

  return (
    <main
      className={cn(
        "relative isolate h-full min-h-screen bg-white text-black",
        headingFont.variable,
        monoFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_18%,rgba(39,75,125,0.14),transparent_35%),radial-gradient(circle_at_84%_2%,rgba(27,52,88,0.12),transparent_33%),radial-gradient(circle_at_50%_90%,rgba(39,75,125,0.08),transparent_40%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-45" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(122deg,rgba(39,75,125,0.08)_0%,transparent_34%,rgba(39,75,125,0.08)_54%,transparent_74%)] opacity-55" />

      <div
        ref={scrollContainerRef}
        className="relative h-full overflow-x-hidden overflow-y-auto"
      >
        <div ref={topSentinelRef} aria-hidden className="h-px w-full" />

        <header
          className={cn(
            "sticky top-0 z-[9999] flex items-center justify-between px-6 pb-2 pt-2 transition-all duration-300 sm:px-8 lg:px-10",
            isAtTop
              ? "border-b border-transparent bg-transparent shadow-none backdrop-blur-0"
              : "backdrop-blur-md bg-white/50 shadow-sm",
          )}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="transition-opacity duration-200 hover:opacity-70"
            >
              <Image
                src="/BetterInternshipLogo.png"
                alt="BetterInternship"
                width={40}
                height={40}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
            </Link>
            <span className="text-xl font-black text-black/30 sm:text-2xl">
              x
            </span>
            <Link
              href={ANTERIORE_SITE_URL}
              aria-label="Visit Anteriore website"
              className="transition-all duration-200 hover:opacity-80 "
            >
              <Image
                src={anterioreLogo}
                alt="Anteriore"
                className="h-auto w-[clamp(8rem,13vw,11rem)] [filter:brightness(0)_saturate(100%)_invert(21%)_sepia(17%)_saturate(1612%)_hue-rotate(184deg)_brightness(88%)_contrast(93%)]"
              />
            </Link>
          </div>
        </header>

        <section className="relative mx-auto flex min-h-[calc(100svh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-4xl text-left">
            <SuperListingBadge variant="gold" />

            <h1 className="mt-8 [font-family:var(--font-anteriore-heading)] text-[clamp(2.5rem,9vw,5.5rem)] font-black uppercase leading-[0.88] tracking-[-0.05em]">
              <div className="flex gap-5">
                <Link
                  href={ANTERIORE_SITE_URL}
                  className="block w-fit text-[#274b7d] transition-all duration-200  hover:text-[#1b3458]"
                >
                  Anteriore
                </Link>
                is
              </div>
              <span className="block">challenging you</span>
            </h1>

            <div className="mt-6 inline-flex items-center rounded-lg border-2 border-[#274b7d] bg-white px-5 py-2">
              <span className="[font-family:var(--font-anteriore-heading)] text-[clamp(0.9rem,2vw,1.1rem)] uppercase tracking-[0.08em] text-[#274b7d]">
                Looking for: {""}
                <span className="font-black">Web Dev Interns</span>
              </span>
            </div>

            <div className="mt-8 max-w-2xl">
              <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/65 sm:text-[15px]">
                Anteriore is a startup that delivers tailor-made IT services
                that drive businesses forward.
              </p>
            </div>

            <div className="mt-12 grid gap-12 lg:grid-cols-[2fr_1.2fr]">
              <div></div>

              <div className="w-full max-w-sm bg-white">
                <div className="relative border-2 border-[#274b7d] bg-gradient-to-br from-[#274b7d]/8 to-[#1b3458]/5 p-6 shadow-[0_12px_35px_-25px_rgba(39,75,125,0.75)]">
                  <div className="absolute -top-4 -left-3 text-5xl font-black leading-none text-[#274b7d]/20">
                    "
                  </div>
                  <div className="relative z-10 space-y-3">
                    <p className="[font-family:var(--font-anteriore-heading)] text-base font-black leading-tight text-[#274b7d]">
                      All the interns I've hired got 6 figure offers after their
                      internships.
                    </p>
                    <p className="[font-family:var(--font-anteriore-heading)] text-xs font-semibold tracking-[0.05em] text-[#1b3458]">
                      - Seaver
                      <span className="text-black/50">
                        , Founder of Anteriore
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                  {hasChallengePdf ? (
                    <div className="group relative isolate block w-full sm:w-auto">
                      <div className="pointer-events-none absolute inset-0 z-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#274b7d_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                      <Link
                        href={CHALLENGE_PDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 flex h-16 w-full items-center justify-center gap-2 rounded-none border-2 border-[#274b7d] bg-[#274b7d] px-11 [font-family:var(--font-anteriore-heading)] text-base font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:bg-[#1b3458] sm:inline-flex sm:w-auto"
                      >
                        View Challenge
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="relative flex h-16 w-full items-center justify-center gap-2 rounded-none border-2 border-[#274b7d]/40 bg-white px-11 [font-family:var(--font-anteriore-heading)] text-base font-black uppercase tracking-[0.12em] text-[#274b7d]/50 sm:inline-flex sm:w-auto">
                      View Challenge
                    </div>
                  )}
                </div>
                <p className="[font-family:var(--font-anteriore-mono)] text-xs text-black/65">
                  No resume needed. Get a response in 24 hours
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="relative mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
          <div className="space-y-6">
            <div className="border border-[#274b7d]/30 bg-white px-4 py-2 w-fit">
              <p className="[font-family:var(--font-anteriore-mono)] text-xs uppercase tracking-[0.2em] text-[#274b7d] font-semibold">
                The opportunity
              </p>
            </div>

            <div className="overflow-hidden border-2 border-[#274b7d]/30 bg-white shadow-[0_24px_50px_-28px_rgba(39,75,125,0.45)]">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/KUCGr_XDh5M"
                  title="Anteriore Founder Video"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="max-w-4xl border-2 border-[#274b7d]/30 bg-gradient-to-br from-[#203e68] via-[#1b3458] to-[#162c49] p-6 text-white shadow-[0_24px_50px_-28px_rgba(39,75,125,0.9)] sm:p-8">
              <p className="[font-family:var(--font-anteriore-heading)] text-[clamp(1.2rem,2.6vw,1.9rem)] font-black leading-tight tracking-[-0.02em] text-white">
                You'll be working in a startup environment where you'll be given
                a lot of responsibilities. If you're serious about growth and
                aspire to become a strong CTO in the future, you'll thrive here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
