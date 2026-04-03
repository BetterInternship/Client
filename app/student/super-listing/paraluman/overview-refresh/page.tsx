"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "../components/OverviewPanel";
import paralumanLogo from "../logo.png";
import type { CEOProfile } from "../components/types";

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

const CEO_PROFILE: CEOProfile = {
  name: "Anna Mae Yu Lamentillo",
  role: "Paraluman CEO, \nFormer Undersecretary of DICT,\nFormer Chairperson of Build, Build, Build program",
  imageSrc:
    "https://images.gmanews.tv/webpics/2024/10/Untitled_design_(28)_2024_10_03_15_20_56.jpg",
  profileUrl: "https://www.annamaeyulamentillo.com/",
};

const CHALLENGE_VIDEO_URL = "";

export default function ParalumanOverviewRefreshPage() {
  const router = useRouter();
  const hasChallengeVideo = CHALLENGE_VIDEO_URL.trim().length > 0;

  const goToMainListing = () => {
    router.push("/student/super-listing/paraluman");
  };

  return (
    <main
      className={cn(
        "relative isolate min-h-screen bg-[#f8f5fb] text-black",
        headingFont.variable,
        monoFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_12%,rgba(114,6,140,0.12),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(114,6,140,0.1),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(114,6,140,0.07),transparent_44%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)] bg-[size:46px_46px] opacity-28" />

      <header className="relative z-30 flex items-center justify-between px-4 py-3 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="transition-opacity duration-200 hover:opacity-75"
          >
            <Image
              src="/BetterInternshipLogo.png"
              alt="BetterInternship"
              width={44}
              height={44}
              className="h-10 w-10 sm:h-12 sm:w-12"
            />
          </Link>

          <span className="text-xs font-semibold uppercase text-black/45">
            x
          </span>

          <Link
            href="https://www.paraluman.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity duration-200 hover:opacity-80"
          >
            <Image
              src={paralumanLogo}
              alt="Paraluman"
              className="h-7 w-auto sm:h-8"
              priority
            />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto flex max-w-5xl justify-center overflow-hidden pb-20 pt-12 sm:pb-28 sm:pt-16 lg:pb-32 lg:pt-20">
        <div className="relative mx-auto w-full max-w-4xl">
          <div className="flex flex-col items-center space-y-6 text-center sm:space-y-7">
            <Link
              href="https://www.paraluman.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto inline-flex w-fit transition-opacity duration-300 hover:opacity-85"
            >
              <Image
                src={paralumanLogo}
                alt="Paraluman"
                className="h-auto w-24 sm:w-32"
                priority
              />
            </Link>

            <h1 className="[font-family:var(--font-paraluman-heading)] max-w-2xl text-[clamp(3.2rem,9vw,7.5rem)] font-black uppercase leading-[0.75] tracking-[-0.025em] text-black">
              <span className="block text-[#72068c]">Shape</span>
              <span className="block">Filipino</span>
              <span className="block">Stories</span>
            </h1>

            <div className="mx-auto inline-flex w-fit rounded-[0.33em] border border-[#72068c]/25 bg-white/70 px-4 py-2 backdrop-blur-sm">
              <span className="[font-family:var(--font-paraluman-mono)]  font-black uppercase  text-[#72068c]">
                Looking for: Web Development Interns
              </span>
            </div>

            <p className="[font-family:var(--font-paraluman-mono)] max-w-xl text-base leading-7 text-black/70 sm:text-lg sm:leading-8">
              <span className="block font-bold text-[#72068c]">
                Build real tools for a real newsroom
              </span>
              <span className="mt-4 block">
                <span className="font-bold text-[#72068c]">Paraluman</span> is a
                youth-led Philippine news platform making every story accessible
                in both English and Filipino.
              </span>
              <span className="mt-4 block">
                Join our team to build and{" "}
                <span className="font-bold text-[#72068c]">
                  improvehow articles are created, processed, and published
                </span>{" "}
                to reach thousands of readers.
              </span>
            </p>

            <div className="flex flex-col items-center gap-3 pt-3">
              <Button
                type="button"
                onClick={goToMainListing}
                className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-lg border-2 border-[#72068c] bg-[#72068c] px-8 [font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.09em] text-white transition-all duration-300 hover:bg-[#5a0570] hover:shadow-[0_24px_48px_-16px_rgba(114,6,140,0.6)] active:scale-95 sm:w-auto sm:px-12 sm:text-xl"
              >
                Apply now
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-[#72068c]">{"\u2022"}</span>
                  <span className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#5d0476]">
                    No resume required
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#72068c]">{"\u2022"}</span>
                  <span className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#5d0476]">
                    24h response
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <OverviewPanel
            hasChallengeVideo={hasChallengeVideo}
            challengeVideoUrl={CHALLENGE_VIDEO_URL}
            ceoProfile={CEO_PROFILE}
            onGoToApply={goToMainListing}
          />
        </div>
      </section>
    </main>
  );
}
