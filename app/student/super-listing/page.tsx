import Link from "next/link";
import Image from "next/image";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  MapPin,
} from "lucide-react";

import { challengePhChallenges } from "@/app/student/challenges/data";
import {
  ChallengePhInteractiveMap,
  SuperListingMapBackground,
} from "@/components/features/student/super-listing/philippines-infographic-map";
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

const featuredBounties = challengePhChallenges.slice(0, 4);

function HeroSection() {
  const socialProofItems = [
    {
      value: 151,
      label: "challenges",
    },
    {
      value: "6.12M",
      label: "rewards",
    },
    {
      value: "131",
      label: "successes",
    },
  ];

  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#031226] pb-44 text-white">
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-[#031226]/78 to-[#031226]" />
      <div className="relative z-10 mx-auto grid w-full max-w-[92rem] flex-1 gap-10 px-4 pt-14 sm:px-6 lg:min-h-screen lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8 lg:pt-8 xl:gap-12">
        <div className="lg:pl-8 xl:pl-14">
          <h1 className="mt-6 [font-family:var(--font-challenge-ph-heading)] text-[clamp(2.45rem,4.6vw,4.35rem)] font-bold leading-[0.96] tracking-[-0.04em] whitespace-nowrap">
            <span className="block text-white">Solve 🇵🇭 challenges</span>

            <span className="block text-[#BFE7FF] ">Win rewards.</span>
            <span className="block text-[#FFC83D]">Make a difference.</span>
          </h1>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/super-listing/search"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[0.55rem] bg-[#0D6BFF] px-12 [font-family:var(--font-challenge-ph-heading)] font-bold text-white shadow-[0_18px_46px_rgba(13,107,255,0.38)] transition hover:bg-[#2D7DFF]"
            >
              Explore bounties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 max-w-xl overflow-hidden rounded-[0.65rem] border border-white/10 bg-[#061A35]/58 backdrop-blur-md whitespace-nowrap">
            <div className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {socialProofItems.map((item) => (
                <div key={item.label} className="px-4 py-3.5">
                  <p className="[font-family:var(--font-challenge-ph-heading)] text-4xl font-bold leading-none tracking-[-0.03em] text-white">
                    {item.value}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold leading-tight text-[#C5D4EA]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 max-w-2xl">
            <p className="text-sm font-semibold leading-6 text-[#C5D4EA] sm:text-[0.95rem] sm:leading-7">
              Open to all PH students nationwide.
            </p>
          </div>
        </div>
        <div
          id="problem-map"
          className="relative mx-auto hidden w-full max-w-[70rem] -translate-y-6 scale-125 scroll-mt-[28vh] transition-transform duration-500 ease-out lg:block xl:scale-[1.42]"
        >
          <ChallengePhInteractiveMap />
        </div>
      </div>
      <style>
        {`
          html {
            scroll-behavior: smooth;
          }

          #problem-map:target {
            z-index: 30;
            transform: translate(0, -2.5rem) scale(1.18);
          }

          @media (min-width: 1280px) {
            #problem-map:target {
              transform: translate(0, -3rem) scale(1.25);
            }
          }
        `}
      </style>
    </section>
  );
}

function PipelineStep({
  number,
  title,
  body,
  accent,
}: {
  number: string;
  title: string;
  body: string;
  accent: "blue" | "gold";
}) {
  const isGold = accent === "gold";

  return (
    <article
      className={cn(
        "group relative grid gap-4 rounded-[0.65rem] bg-white/80 p-5 shadow-[0_22px_70px_-58px_rgba(8,26,58,0.8)] backdrop-blur sm:grid-cols-[5rem_1fr_1.5rem] sm:items-center",
      )}
    >
      <span
        className={cn(
          "[font-family:var(--font-challenge-ph-mono)] text-4xl font-semibold tracking-[-0.05em]",
          isGold ? "text-[#D99B00]" : "text-[#0D6BFF]",
        )}
      >
        [{number}]
      </span>
      <div className=" sm:pl-4">
        <h3 className="[font-family:var(--font-challenge-ph-heading)] text-lg font-bold leading-tight text-[#081A3A]">
          {title}
        </h3>
        <p className="max-w-xl text-sm font-semibold leading-6 text-[#405979]">
          {body}
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
    <section className="relative overflow-hidden px-4 pb-16 pt-24 text-[#081A3A] sm:px-6 sm:pt-28 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,107,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,107,255,0.045)_1px,transparent_1px)] bg-[size:38px_38px] [mask-image:linear-gradient(to_bottom,transparent_0rem,transparent_6rem,#000_18rem,transparent_88%)]" />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="[font-family:var(--font-challenge-ph-mono)] text-xs font-bold uppercase tracking-[0.18em] text-white">
            Mission Pipeline
          </p>
          <h2 className="mt-3 [font-family:var(--font-challenge-ph-heading)] text-3xl font-bold tracking-[-0.04em] sm:text-5xl text-white">
            Your path from challenge to impact
          </h2>
        </div>
        <div className="relative mt-12 space-y-9 lg:ml-20">
          <div className="absolute bottom-8 left-0 top-6 hidden w-px bg-gradient-to-b from-[#0D6BFF] via-[#0D6BFF] via-48% to-[#FFC83D] lg:block" />

          <div className="relative lg:pl-14">
            <div className="mb-4 flex items-center gap-3">
              <div>
                <p className="[font-family:var(--font-challenge-ph-mono)] text-xl font-black uppercase text-white">
                  MAIN CHALLENGE
                </p>
                <p className="text-sm font-semibold text-white">
                  Open to all participants
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <PipelineStep
                number="01"
                title="Choose a Philippine challenge that matters to you"
                body="Browse real briefs and pick a problem you care about solving."
                accent="blue"
              />
              <PipelineStep
                number="02"
                title="Compete to build the best solution"
                body="Study the brief, create your submission, and show how you think."
                accent="blue"
              />
              <PipelineStep
                number="03"
                title="Win cash prizes and exclusive rewards"
                body="Top solutions earn prizes, recognition, and a chance to go further."
                accent="blue"
              />
            </div>
          </div>

          <div className="relative lg:pl-14">
            <div className="mb-4 flex items-center gap-3">
              <div>
                <p className="[font-family:var(--font-challenge-ph-mono)] text-xl font-bold uppercase  text-[#D99B00] ">
                  OPTIONAL: SUPER CHALLENGE
                </p>
                <p className="text-sm font-semibold text-[#405979]">
                  For selected winners
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <PipelineStep
                number="04"
                title="Receive an invitation to implement your prototype"
                body="Outstanding participants may be invited into the next stage."
                accent="gold"
              />
              <PipelineStep
                number="05"
                title="Partner with senior leaders to bring your solution to life"
                body="Collaborate with mentors, operators, and decision-makers to refine the work."
                accent="gold"
              />
              <PipelineStep
                number="06"
                title="Earn your place on the ChallengePH Wall of Fame"
                body="Ship real impact and get recognized as a standout builder."
                accent="gold"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BountyCard({
  challenge,
}: {
  challenge: (typeof challengePhChallenges)[number];
}) {
  const amount =
    challenge.reward.match(/(PHP[\s\d,]+)/i)?.[1]?.trim() ?? challenge.reward;

  return (
    <article className="group flex min-h-[20rem] flex-col rounded-[0.33em] border border-[#dfe7f2] bg-white/95 p-4 shadow-[0_20px_58px_-50px_rgba(8,26,58,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_28px_80px_-58px_rgba(8,26,58,0.78)] sm:min-h-[25rem] sm:p-5">
      <div className="overflow-hidden">
        <h3 className="[font-family:var(--font-challenge-ph-heading)] text-[1.35rem] font-black leading-[1.07] tracking-[-0.055em] text-[#081A3A]">
          {challenge.shortTitle}
        </h3>
      </div>

      <p className="mt-1.5 [font-family:var(--font-challenge-ph-heading)] font-black leading-snug text-[#0D6BFF]">
        {amount}
      </p>

      <p className="mt-3 text-sm font-semibold leading-6 text-[#081A3A]/78">
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

      <div className="mt-4 flex min-h-[4.5rem] flex-wrap content-start gap-2">
        {challenge.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-[0.33em] bg-[#eef7ff] px-2.5 py-1 [font-family:var(--font-challenge-ph-mono)] text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#28466f]"
          >
            {tag}
          </span>
        ))}
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
      <div className="mx-auto max-w-7xl sm:px-8">
        <div className="text-center">
          <div
            className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#0D6BFF]/30 bg-[#EAF5FF] shadow-[0_18px_50px_-30px_rgba(13,107,255,0.8)]"
            aria-hidden="true"
          >
            <div className="absolute inset-2 rounded-full border border-[#0D6BFF]/20" />
            <div className="absolute inset-5 rounded-full border border-[#0D6BFF]/20" />
            <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-[#0D6BFF]/18" />
            <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 bg-[#0D6BFF]/18" />
            <div className="absolute h-2 w-2 rounded-full bg-[#0D6BFF] shadow-[0_0_18px_rgba(13,107,255,0.85)]" />
            <div className="absolute inset-0 animate-[spin_2.8s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,rgba(13,107,255,0.42)_0deg,rgba(13,107,255,0.16)_34deg,transparent_76deg,transparent_360deg)] [clip-path:circle(50%)]" />
          </div>
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
        <div className="relative mx-auto mt-9 grid max-w-[1120px] gap-3 pb-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {featuredBounties.map((challenge) => (
            <BountyCard key={challenge.id} challenge={challenge} />
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
        <SuperListingMapBackground className="pointer-events-none absolute -right-24 top-1/2 hidden w-[38rem] -translate-y-1/2 opacity-[0.14] [mask-image:linear-gradient(to_left,#000_48%,transparent_100%)] sm:block lg:right-[4%] lg:w-[48rem]" />
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
      <div className="relative -mt-40 overflow-hidden bg-[linear-gradient(to_bottom,#031226_0rem,#031226_10rem,#082044_22rem,#D9F0FF_38rem,#F8FBFF_54rem,#FFFFFF_70rem)] pt-40">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(140,200,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(140,200,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px] opacity-35 [mask-image:linear-gradient(to_bottom,#000_0rem,transparent_30rem)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_50%_5rem,rgba(45,125,255,0.22),rgba(13,107,255,0.12)_34%,transparent_72%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#031226] to-transparent" />
        <div className="relative">
          <MissionPipeline />
          <LiveBounties />
          <FinalCTA />
        </div>
      </div>
    </main>
  );
}
