"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
  Search,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { challengePhChallenges } from "@/app/student/challenges/data";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-super-listings-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-super-listings-mono",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-super-listings-body",
});

type Challenge = (typeof challengePhChallenges)[number];


function ListingsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#001138] bg-[url('/super-listings/bg2_mobile.png')] bg-cover bg-center px-4 pb-20 pt-20 text-center sm:bg-[url('/super-listings/bg2.png')] sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-28">
      <div className="absolute left-4 top-4 z-30 inline-flex transition-opacity duration-200 hover:opacity-75 sm:left-6 sm:top-6">
        <Image
          src="/BetterInternshipLogo.png"
          alt="BetterInternship"
          width={40}
          height={40}
          className="h-10 w-10 sm:h-12 sm:w-12"
          priority
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[#001138]/58" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mx-auto mb-4 inline-flex rounded-[0.33em] border border-[#FFF7E8]/22 bg-[#FFF7E8]/10 px-3 py-1 [font-family:var(--font-super-listings-mono)] text-xs font-semibold uppercase tracking-[0.14em] text-[#FFF7E8]/82">
          Bounties for real Philippine problems
        </p>
        <h1
          className="[font-family:var(--font-super-listings-heading)] text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.98] tracking-[-0.06em]"
          style={{ textShadow: "0 4px 18px rgba(0, 0, 0, 0.35)" }}
        >
          <span className="text-[#FFF7E8]">Challenge PH</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance [font-family:var(--font-super-listings-body)] text-sm leading-6 text-[rgba(255,247,232,0.84)] sm:mt-6 sm:text-xl sm:leading-8">
          Pick a real-world problem, study the brief, and build a solution that
          can earn a bounty, pilot opportunity, or internship path.
        </p>
      </div>
    </section>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const amount =
    challenge.reward.match(/(PHP[\s\d,]+)/i)?.[1]?.trim() ?? challenge.reward;

  return (
    <Card className="group flex flex-col rounded-[0.33em] border-[#dfe7f2] bg-white/95 p-4 shadow-[0_20px_58px_-50px_rgba(8,26,58,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_28px_80px_-58px_rgba(8,26,58,0.78)] sm:p-5">
      <div className="h-[4.5rem] overflow-hidden">
        <h2 className="[font-family:var(--font-super-listings-heading)] text-[1.35rem] font-black leading-[1.07] tracking-[-0.055em] text-[#081A3A]">
          {challenge.shortTitle}
        </h2>
      </div>

      <p
        className="mt-3 [font-family:var(--font-super-listings-heading)] text-sm font-black leading-snug"
        style={{ color: challenge.accent }}
      >
        {amount}
      </p>

      <p className="mt-3 min-h-[5.5rem] [font-family:var(--font-super-listings-body)] text-sm font-semibold leading-6 text-[#081A3A]/78">
        {challenge.summary}
      </p>

      <div className="mt-4 space-y-2 border-t border-[#dfe7f2] pt-4 [font-family:var(--font-super-listings-body)] text-xs font-bold text-[#28466f]/74">
        <p className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-[#2388ff]" />
          {challenge.host}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-[#2388ff]" />
          {challenge.deadline}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-[#2388ff]" />
          {challenge.location}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {challenge.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-[0.33em] bg-[#eef7ff] px-2.5 py-1 [font-family:var(--font-super-listings-mono)] text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#28466f]"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href={`/challenges/${challenge.id}`}
        className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border border-[#2388ff] px-4 [font-family:var(--font-super-listings-heading)] text-sm font-bold text-[#2388ff] transition-colors hover:bg-[#2388ff] hover:text-white"
      >
        View challenge
        <ArrowRight className="h-5 w-5" />
      </Link>
    </Card>
  );
}

function ListingsGrid() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChallenges = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return challengePhChallenges;

    return challengePhChallenges.filter((challenge) =>
      [
        challenge.host,
        challenge.sector,
        challenge.title,
        challenge.shortTitle,
        challenge.summary,
        challenge.reward,
        challenge.location,
        ...challenge.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchTerm]);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,#001138_0rem,#001138_8rem,#10284b_16rem,#eef7ff_30rem,#f7fbff_40rem,#ffffff_100%)] px-3 pb-12 pt-4 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(13,107,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,107,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-55 [mask-image:linear-gradient(to_bottom,transparent_0rem,transparent_16rem,#000_28rem)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20rem,rgba(13,107,255,0.1),transparent_18rem),radial-gradient(circle_at_30%_86%,rgba(13,107,255,0.08),transparent_28%)]" />

      <div className="relative mx-auto mb-5 max-w-[1120px]">
        <div className="flex items-center gap-3 rounded-[0.33em] border border-[#dbe6f5] bg-white p-2">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-[0.33em] px-3 transition-colors focus-within:bg-white">
            <Search className="h-4 w-4 shrink-0 text-[#2388ff]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search challenges, sectors, rewards, or locations"
              className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 [font-family:var(--font-super-listings-body)] text-sm font-semibold text-[#081A3A] shadow-none outline-none ring-0 placeholder:text-[#28466f]/55 focus:border-0 focus:outline-none focus:ring-0"
            />
          </label>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1120px] gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {filteredChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>

      {filteredChallenges.length === 0 ? (
        <div className="relative mx-auto mt-6 max-w-[1120px] rounded-[0.33em] border border-[#dbe6f5] bg-white px-5 py-8 text-center [font-family:var(--font-super-listings-body)] text-sm font-semibold text-[#28466f]">
          No Challenge PH briefs match that search yet.
        </div>
      ) : null}
    </section>
  );
}

export default function SuperListingsBrowsePage() {
  return (
    <main
      className={cn(
        "min-h-screen overflow-x-hidden bg-white [font-family:var(--font-super-listings-body)]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <ListingsHero />
      <ListingsGrid />
    </main>
  );
}
