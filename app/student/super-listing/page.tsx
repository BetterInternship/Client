import Link from "next/link";
import Image from "next/image";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Code2,
  Compass,
  Landmark,
  Lightbulb,
  Mail,
  MapPin,
  Newspaper,
  Plane,
  Sprout,
  Trophy,
  Users,
} from "lucide-react";

import { challengePhChallenges } from "@/app/student/challenges/data";
import { ChallengePhInteractiveMap } from "@/components/features/student/super-listing/philippines-infographic-map";
import { cn } from "@/lib/utils";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-challenge-ph-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-challenge-ph-mono",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-challenge-ph-body",
});

const pipelineGroups = [
  {
    label: "MAIN CHALLENGE",
    sublabel: "Open to all participants",
    accent: "blue" as const,
    steps: [
      {
        number: "01",
        icon: Compass,
        title: "Choose a Philippine challenge that matters to you",
        body: "Browse real briefs and pick a problem you care about solving.",
      },
      {
        number: "02",
        icon: Lightbulb,
        title: "Compete to build the best solution",
        body: "Study the brief, create your submission, and show how you think.",
      },
      {
        number: "03",
        icon: Trophy,
        title: "Win cash prizes and exclusive rewards",
        body: "Top solutions earn prizes, recognition, and a chance to go further.",
      },
    ],
  },
  {
    label: "OPTIONAL: SUPER CHALLENGE",
    sublabel: "For selected winners",
    accent: "gold" as const,
    steps: [
      {
        number: "04",
        icon: Mail,
        title: "Receive an invitation to implement your prototype",
        body: "Outstanding participants may be invited into the next stage.",
      },
      {
        number: "05",
        icon: Users,
        title: "Partner with senior leaders to bring your solution to life",
        body: "Collaborate with mentors, operators, and decision-makers to refine the work.",
      },
      {
        number: "06",
        icon: Award,
        title: "Earn your place on the ChallengePH Wall of Fame",
        body: "Ship real impact and get recognized as a standout builder.",
      },
    ],
  },
];

const bountyIcons = [
  Code2,
  BrainCircuit,
  Landmark,
  Plane,
  Newspaper,
  Sprout,
] as const;

const featuredBounties = challengePhChallenges.slice(0, 4);

function HeroSection() {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#031226] pb-28 text-white">
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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(140,200,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(140,200,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px] opacity-55 [mask-image:radial-gradient(circle_at_70%_35%,#000_0%,transparent_78%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(13,107,255,0.24),transparent_30rem),radial-gradient(circle_at_76%_44%,rgba(45,125,255,0.18),transparent_34rem)]" />
      <div className="pointer-events-none absolute left-[14%] top-[28%] h-1.5 w-1.5 animate-pulse rounded-full bg-[#66c2ff]/80 shadow-[0_0_12px_rgba(102,194,255,0.65)] [animation-duration:2.8s]" />
      <div className="pointer-events-none absolute right-[20%] top-[22%] h-2 w-2 animate-pulse rounded-full bg-[#2388ff]/75 shadow-[0_0_14px_rgba(35,136,255,0.62)] [animation-delay:0.7s] [animation-duration:3.2s]" />
      <div className="pointer-events-none absolute bottom-[28%] left-[31%] h-1.5 w-1.5 animate-pulse rounded-full bg-white/65 shadow-[0_0_10px_rgba(255,255,255,0.5)] [animation-delay:1.2s] [animation-duration:3.6s]" />
      <div className="pointer-events-none absolute bottom-[18%] right-[34%] h-1 w-1 animate-pulse rounded-full bg-[#8cd3ff]/70 shadow-[0_0_10px_rgba(140,211,255,0.5)] [animation-delay:1.9s] [animation-duration:3s]" />
      <div className="pointer-events-none absolute left-[72%] top-[68%] h-1.5 w-1.5 animate-pulse rounded-full bg-[#66c2ff]/60 shadow-[0_0_10px_rgba(102,194,255,0.45)] [animation-delay:2.4s] [animation-duration:3.8s]" />
      <div className="relative z-10 mx-auto grid w-full max-w-[92rem] flex-1 gap-10 px-4 pt-14 sm:px-6 lg:min-h-screen lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8 lg:pt-8">
        <div>
          <h1 className="mt-6 max-w-3xl text-white [font-family:var(--font-challenge-ph-heading)] text-[clamp(3.2rem,8vw,6.4rem)] font-bold leading-[0.92] tracking-[-0.05em]">
            Solve real Philippine problems.
            <span className="block bg-gradient-to-r from-white via-[#8cd3ff] to-[#2388ff] bg-clip-text text-transparent">
              Win real bounties.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm font-semibold leading-7 text-[#C5D4EA] sm:text-base sm:leading-8">
            ChallengePH connects students with real-world briefs across the
            Philippines — from mobility and MSMEs to climate, health, and local
            governance. Build a solution, submit your work, and compete for cash
            bounties and pilot opportunities.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/super-listing/search"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[0.55rem] bg-[#0D6BFF] px-12 [font-family:var(--font-challenge-ph-heading)] font-bold text-white shadow-[0_18px_46px_rgba(13,107,255,0.38)] transition hover:bg-[#2D7DFF]"
            >
              Explore bounties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div
          id="problem-map"
          className="relative mx-auto hidden w-full max-w-[58rem] scale-110 lg:block xl:scale-125"
        >
          <ChallengePhInteractiveMap />
        </div>
      </div>
    </section>
  );
}

function PipelineStep({
  step,
  accent,
}: {
  step: (typeof pipelineGroups)[number]["steps"][number];
  accent: "blue" | "gold";
}) {
  const Icon = step.icon;
  const isGold = accent === "gold";

  return (
    <article
      className={cn(
        "group relative grid gap-4 rounded-[0.65rem] border bg-white/66 p-5 shadow-[0_22px_70px_-58px_rgba(8,26,58,0.8)] backdrop-blur sm:grid-cols-[5rem_4.5rem_1fr_1.5rem] sm:items-center",
        isGold ? "border-[#FFC83D]/35" : "border-[#0D6BFF]/20",
      )}
    >
      <div
        className={cn(
          "absolute -left-[3.05rem] top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 bg-white shadow-[0_0_0_5px_rgba(13,107,255,0.12)] lg:block",
          isGold ? "border-[#FFC83D]" : "border-[#0D6BFF]",
        )}
      />
      <span
        className={cn(
          "[font-family:var(--font-challenge-ph-mono)] text-3xl font-semibold tracking-[-0.05em]",
          isGold ? "text-[#D99B00]" : "text-[#0D6BFF]",
        )}
      >
        [{step.number}]
      </span>
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border",
          isGold
            ? "border-[#FFC83D]/28 bg-[#FFF8E2] text-[#D99B00]"
            : "border-[#0D6BFF]/18 bg-[#EEF7FF] text-[#0D6BFF]",
        )}
      >
        <Icon className="h-7 w-7" />
      </span>
      <div className="border-[#D7E3F2] sm:border-l sm:pl-8">
        <h3 className="[font-family:var(--font-challenge-ph-heading)] text-lg font-bold leading-tight text-[#081A3A]">
          {step.title}
        </h3>
        <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#405979]">
          {step.body}
        </p>
      </div>
      <ChevronRight
        className={cn(
          "hidden h-5 w-5 justify-self-end sm:block",
          isGold ? "text-[#D99B00]" : "text-[#0D6BFF]",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-5 right-8 h-16 w-24 opacity-45 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:9px_9px]",
          isGold ? "text-[#FFC83D]" : "text-[#8CC8FF]",
        )}
      />
    </article>
  );
}

function MissionPipeline() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-32 text-[#081A3A] sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,107,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,107,255,0.045)_1px,transparent_1px)] bg-[size:38px_38px] [mask-image:linear-gradient(to_bottom,transparent_0rem,#000_14rem,transparent_88%)]" />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="[font-family:var(--font-challenge-ph-mono)] text-xs font-bold uppercase tracking-[0.18em] text-[#0D6BFF]">
            Mission Pipeline
          </p>
          <h2 className="mt-3 [font-family:var(--font-challenge-ph-heading)] text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
            Your path from challenge to impact
          </h2>
        </div>
        <div className="relative mt-12 space-y-9 lg:ml-20">
          <div className="absolute bottom-8 left-0 top-6 hidden w-px bg-gradient-to-b from-[#0D6BFF] via-[#0D6BFF] via-48% to-[#FFC83D] lg:block" />
          {pipelineGroups.map((group) => (
            <div key={group.label} className="relative lg:pl-14">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={cn(
                    "hidden h-9 w-9 items-center justify-center rounded-full border bg-white lg:flex",
                    group.accent === "gold"
                      ? "border-[#FFC83D] text-[#D99B00]"
                      : "border-[#0D6BFF] text-[#0D6BFF]",
                  )}
                >
                  <CircleDot className="h-5 w-5" />
                </span>
                <div>
                  <p
                    className={cn(
                      "[font-family:var(--font-challenge-ph-mono)] text-sm font-bold uppercase tracking-[0.16em]",
                      group.accent === "gold"
                        ? "text-[#D99B00]"
                        : "text-[#0D6BFF]",
                    )}
                  >
                    {group.label}
                  </p>
                  <p className="text-sm font-semibold text-[#405979]">
                    {group.sublabel}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {group.steps.map((step) => (
                  <PipelineStep
                    key={step.number}
                    step={step}
                    accent={group.accent}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BountyCard({
  challenge,
  index,
}: {
  challenge: (typeof challengePhChallenges)[number];
  index: number;
}) {
  const Icon = bountyIcons[index % bountyIcons.length];
  const amount =
    challenge.reward.match(/(PHP[\s\d,]+)/i)?.[1]?.trim() ?? challenge.reward;
  const accent = challenge.accent;

  return (
    <article className="group flex min-h-[22rem] min-w-[15.5rem] flex-col rounded-[0.33em] border border-[#dfe7f2] bg-white/95 p-5 shadow-[0_20px_58px_-50px_rgba(8,26,58,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_28px_80px_-58px_rgba(8,26,58,0.78)]">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-[0.55rem] border border-[#DDE8F5] bg-[#F8FBFF]"
        style={{ color: accent }}
      >
        <Icon className="h-7 w-7" />
      </span>
      <p
        className="mt-5 [font-family:var(--font-challenge-ph-mono)] text-[0.62rem] font-bold uppercase tracking-[0.12em]"
        style={{ color: accent }}
      >
        {challenge.sector}
      </p>
      <p className="mt-2 text-xs font-bold text-[#6F83A1]">{challenge.host}</p>
      <h3 className="mt-3 [font-family:var(--font-challenge-ph-heading)] text-[1.35rem] font-black leading-[1.07] tracking-[-0.055em] text-[#081A3A]">
        {challenge.shortTitle}
      </h3>
      <p className="mt-1.5 [font-family:var(--font-challenge-ph-heading)] font-black leading-snug text-[#0D6BFF]">
        {amount}
      </p>
      <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[#081A3A]/78">
        {challenge.summary}
      </p>
      <div className="mt-4 space-y-2 border-t border-[#dfe7f2] pt-4 text-xs font-bold text-[#28466f]/74">
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
      <Link
        href={`/challenges/${challenge.id}`}
        className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border border-[#2388ff] px-4 [font-family:var(--font-challenge-ph-heading)] text-sm font-bold text-[#2388ff] transition-colors hover:bg-[#2388ff] hover:text-white"
      >
        View
        <ArrowRight className="h-5 w-5" />
      </Link>
    </article>
  );
}

function LiveBounties() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[0.8rem] border border-[#E2ECF7] bg-white/92 px-4 py-10 shadow-[0_24px_90px_-76px_rgba(8,26,58,0.8)] sm:px-8">
        <div className="text-center">
          <p className="[font-family:var(--font-challenge-ph-mono)] text-xs font-bold uppercase tracking-[0.18em] text-[#0D6BFF]">
            Live Bounties
          </p>
          <h2 className="mt-2 [font-family:var(--font-challenge-ph-heading)] text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
            Find your challenge
          </h2>
          <p className="mt-3 font-semibold text-[#6B7F9B]">
            Real problems. Real rewards. Real opportunities.
          </p>
        </div>
        <div className="mt-9 grid gap-3 overflow-x-auto pb-3 md:grid-cols-2 lg:grid-cols-4">
          {featuredBounties.map((challenge, index) => (
            <BountyCard
              key={challenge.id}
              challenge={challenge}
              index={index}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/super-listing/search"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0D6BFF]"
          >
            View all challenges <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-4 pb-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto overflow-hidden rounded-[0.8rem] bg-[#031226] px-6 py-14 text-center text-white shadow-[0_28px_100px_-60px_rgba(3,18,38,0.8)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(140,200,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(140,200,255,0.09)_1px,transparent_1px)] bg-[size:36px_36px] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_48%,rgba(13,107,255,0.34),transparent_16rem),radial-gradient(circle_at_86%_38%,rgba(45,125,255,0.28),transparent_17rem),linear-gradient(to_top,rgba(45,125,255,0.28),transparent_32%)]" />
        <div className="relative mx-auto">
          <h2 className="[font-family:var(--font-challenge-ph-heading)] text-3xl font-bold tracking-[-0.04em] sm:text-5xl text-white">
            Ready to build something that matters?
          </h2>
          <p className="mx-auto mt-4 text-base font-semibold leading-7 text-[#C5D4EA]">
            Explore live briefs, compete for bounties, and turn your work into
            real-world opportunity.
          </p>
          <Link
            href="/super-listing/search"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-[0.55rem] bg-[#0D6BFF] px-8 [font-family:var(--font-challenge-ph-heading)] text-sm font-bold text-white shadow-[0_18px_46px_rgba(13,107,255,0.38)] transition hover:bg-[#2D7DFF]"
          >
            See all challenges <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#B9CAE4]">
            <span>Free to join</span>
            <span>Open to students nationwide</span>
            <span>Real problems. Real impact.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function SuperListingsLandingPage() {
  return (
    <main
      className={cn(
        "min-h-screen bg-white [font-family:var(--font-challenge-ph-body)]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <HeroSection />
      <div className="relative overflow-hidden bg-[linear-gradient(to_bottom,#031226_0rem,#082044_4rem,#CFEAFF_15rem,#F8FBFF_28rem,#FFFFFF_46rem)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_50%_0%,rgba(140,200,255,0.85),transparent_64%)]" />
        <div className="relative">
          <MissionPipeline />
          <LiveBounties />
          <FinalCTA />
        </div>
      </div>
    </main>
  );
}
