"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Caveat,
  JetBrains_Mono,
  Open_Sans,
  Space_Grotesk,
} from "next/font/google";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Code2,
  FileSearch,
  PenLine,
  Rocket,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import doodlePack from "../companies/sofi-ai/doodle-pack.png";

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

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-paraluman-body",
});

const handwritingFont = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-paraluman-handwriting",
});

type HeroStickyNoteData = {
  company: string;
  headline: string;
  role: string;
  tone: "cream" | "blue" | "mint" | "lavender" | "yellow";
  pinTone: "blue" | "gold";
  className?: string;
};

type SuperListingData = {
  company: string;
  title: string;
  tags: string[];
  href: string;
  logo: ReactNode;
};

type StepData = {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
};

type StatData = {
  value: string;
  label: string;
  icon: ReactNode;
};

const heroStickyNotes: HeroStickyNoteData[] = [
  {
    company: "Anteriore",
    headline: "Build what the future needs",
    role: "Product & Engineering",
    tone: "cream",
    pinTone: "blue",
    className: "left-[5%] top-[16%] xl:left-[9%] 2xl:left-[13%]",
  },
  {
    company: "Founders For Founders",
    headline: "Help the next great founder rise",
    role: "Accelerator Intern",
    tone: "lavender",
    pinTone: "blue",
    className: "right-[5%] top-[16%] xl:right-[9%] 2xl:right-[13%]",
  },
  {
    company: "Miro",
    headline: "Turn messy ideas into momentum",
    role: "Internship Challenge",
    tone: "mint",
    pinTone: "blue",
    className:
      "left-[4%] top-[43%] hidden sm:block xl:left-[8%] 2xl:left-[12%]",
  },
  {
    company: "Paraluman News",
    headline: "Bring stories across languages",
    role: "News Delivery",
    tone: "yellow",
    pinTone: "gold",
    className:
      "right-[4%] top-[43%] hidden sm:block xl:right-[8%] 2xl:right-[12%]",
  },
  {
    company: "Philippine Chamber of Commerce",
    headline: "Shape ideas that move business",
    role: "Innovation Challenge",
    tone: "cream",
    pinTone: "blue",
    className:
      "left-[7%] bottom-[7%] hidden lg:block xl:left-[12%] 2xl:left-[17%]",
  },
  {
    company: "Sofi AI",
    headline: "Design AI people actually trust",
    role: "Frontend / UI/UX",
    tone: "blue",
    pinTone: "gold",
    className:
      "right-[7%] bottom-[7%] hidden lg:block xl:right-[12%] 2xl:right-[17%]",
  },
];

const previewListings: SuperListingData[] = [
  {
    company: "Anteriore",
    title: "Startup Product and Engineering Challenge",
    tags: ["Product", "Engineering"],
    href: "/super-listing/anteriore",
    logo: <Rocket className="h-5 w-5" />,
  },
  {
    company: "Cebu Pacific",
    title: "Digital Travel Experience Challenge",
    tags: ["UX", "Travel"],
    href: "/super-listing/cebu-pacific",
    logo: <Building2 className="h-5 w-5" />,
  },
  {
    company: "Founders For Founders",
    title: "Startup Accelerator Intern",
    tags: ["Startups", "Growth"],
    href: "/super-listing/fff",
    logo: <BriefcaseBusiness className="h-5 w-5" />,
  },
  {
    company: "Sofi AI",
    title: "Frontend AI Product Challenge",
    tags: ["Frontend", "UI/UX"],
    href: "/super-listing/sofi-ai",
    logo: <PenLine className="h-5 w-5" />,
  },
  {
    company: "Paraluman News",
    title: "Multilingual News Delivery Challenge",
    tags: ["Web", "News"],
    href: "/super-listing/paraluman",
    logo: <Sparkles className="h-5 w-5" />,
  },
];

const howItWorksSteps: StepData[] = [
  {
    step: "1",
    title: "Pick a challenge",
    description: "Choose a challenge that matches your skills and interests.",
    icon: <FileSearch className="h-10 w-10" />,
  },
  {
    step: "2",
    title: "Do real work",
    description: "Complete the task and submit your best work.",
    icon: <Code2 className="h-10 w-10" />,
  },
  {
    step: "3",
    title: "Get noticed",
    description: "Stand out to top companies and get hired.",
    icon: <CheckCircle2 className="h-10 w-10" />,
  },
];

const stats: StatData[] = [
  {
    value: "5,000+",
    label: "Challenges completed",
    icon: <Trophy className="h-7 w-7" />,
  },
  {
    value: "1,200+",
    label: "Students hired",
    icon: <UserCheck className="h-7 w-7" />,
  },
  {
    value: "500+",
    label: "Partner companies",
    icon: <Building2 className="h-7 w-7" />,
  },
  {
    value: "Real impact",
    label: "On real projects",
    icon: <Rocket className="h-7 w-7" />,
  },
];

const stickyNoteToneClasses: Record<HeroStickyNoteData["tone"], string> = {
  cream: "bg-[#FFF9EC]",
  blue: "bg-[#F3F8FF]",
  mint: "bg-[#F2FFFA]",
  lavender: "bg-[#F8F4FF]",
  yellow: "bg-[#FFFBEA]",
};

const stickyNotePinClasses: Record<HeroStickyNoteData["pinTone"], string> = {
  blue: "bg-blue-600",
  gold: "bg-amber-400",
};

function HeroStickyNote({
  headline,
  company,
  role,
  tone,
  pinTone,
  className,
}: HeroStickyNoteData) {
  return (
    <div
      tabIndex={0}
      className={cn(
        "hero-sticky-note absolute isolate z-20 w-[178px] cursor-pointer opacity-55 saturate-[0.78] brightness-[0.62] outline-none transition-[filter,opacity] duration-300 ease-out",
        "sm:w-[200px] lg:w-[230px] 2xl:w-[250px]",
        className,
      )}
      aria-label={`${company}: ${headline}`}
    >
      <span
        className="hero-note-spotlight pointer-events-none absolute left-1/2 top-1/2 z-0 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,252,224,0.78)_0%,rgba(255,237,160,0.58)_48%,rgba(255,230,126,0.34)_68%,transparent_70%)] opacity-0 transition-opacity duration-300 ease-out"
        aria-hidden="true"
      />
      <span
        className={cn(
          "absolute left-1/2 top-0 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm ring-2 ring-white/80",
          stickyNotePinClasses[pinTone],
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "hero-sticky-note-paper relative z-10 min-h-[128px] origin-top border border-[#081A3A]/5 px-4 pb-4 pt-7 text-center shadow-[0_14px_30px_rgba(8,26,58,0.15)] ring-1 ring-white/50",
          "sm:min-h-[160px] sm:px-5 sm:pb-5 sm:pt-8",
          stickyNoteToneClasses[tone],
        )}
      >
        <p className="[font-family:var(--font-paraluman-heading)] text-[17px] font-bold leading-tight tracking-[-0.025em] text-[#081A3A] sm:text-[19px]">
          {headline}
        </p>
        <p className="mt-3 [font-family:var(--font-paraluman-heading)] text-[11px] font-semibold leading-tight text-[#081A3A]/75">
          {company}
        </p>
        <p className="mt-1 [font-family:var(--font-paraluman-body)] text-[10px] leading-snug text-[#081A3A]/55">
          {role}
        </p>
      </div>
    </div>
  );
}

function SuperListingsHero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#061b3d]">
      <Image
        src="/super-listings/bg3.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/65" />
      <div
        className="pointer-events-none absolute left-1/2 top-[15svh] z-10 h-[101svh] w-[92rem] -translate-x-1/2 bg-[linear-gradient(168deg,rgba(255,246,205,0.18)_0%,rgba(255,236,156,0.5)_34%,rgba(255,247,208,0.24)_70%,transparent_100%)] opacity-95 [clip-path:polygon(43%_0,57%_0,100%_100%,0_100%)] blur-sm"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[43%] z-10 h-[26rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,248,218,0.24)_0%,rgba(255,233,151,0.12)_42%,transparent_72%)] blur-2xl"
        aria-hidden="true"
      />
      <div className="absolute inset-0 mx-auto w-full max-w-[1120px] xl:max-w-[1440px] 2xl:max-w-[1680px] min-[1800px]:max-w-[1920px]">
        <div className="absolute inset-x-[4%] bottom-[4%] top-[6%] sm:inset-x-[6%] sm:bottom-[5%] sm:top-[8%] ">
          {heroStickyNotes.map((note) => (
            <HeroStickyNote key={`${note.company}-${note.role}`} {...note} />
          ))}

          <div className="absolute left-1/2 top-[45%] z-50 -translate-x-1/2 -translate-y-1/2 text-center sm:top-[50%]">
            <h1
              className="[font-family:var(--font-paraluman-heading)] text-[1.9rem] font-bold leading-[1.02] tracking-[-0.05em] min-[430px]:text-[2.35rem] sm:text-[3.7rem] md:text-[4.4rem] lg:text-[4.8rem]"
              style={{ textShadow: "0 4px 18px rgba(0, 0, 0, 0.35)" }}
            >
              <span className="block whitespace-nowrap text-[#FFF7E8]">
                Help build a
              </span>
              <span className="block whitespace-nowrap text-[#FFF7E8]">
                better Philippines
              </span>
              <span className="block whitespace-nowrap text-[#F8EBD2]">
                one problem at a time
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-[540px] px-4 [font-family:var(--font-paraluman-body)] text-sm font-semibold leading-7 text-[rgba(255,247,232,0.82)] sm:text-base">
              Challenge-based internships where students prove their skills
              through real work, not just resumes.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full bg-[#FFF7E8] px-8 [font-family:var(--font-paraluman-heading)] text-base font-bold text-[#0D6BFF] shadow-[0_0_34px_rgba(255,208,87,0.42),0_14px_36px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-white sm:h-16 sm:px-10"
              >
                <Link href="/super-listing/search">
                  Explore challenges
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const DOODLE_SPRITES = {
  dashedPath: { row: 0, col: 0 },
  sparkle: { row: 0, col: 1 },
  dotGrid: { row: 0, col: 2 },
  arrow: { row: 0, col: 3 },
  scribble: { row: 1, col: 0 },
  circleAccent: { row: 1, col: 1 },
  stickyNote: { row: 1, col: 2 },
  secondArrow: { row: 1, col: 3 },
  circleAccent2: { row: 2, col: 0 },
  wavyLine: { row: 2, col: 1 },
  profileBubble: { row: 2, col: 2 },
  cornerDots: { row: 2, col: 3 },
} as const;

type DoodleName = keyof typeof DOODLE_SPRITES;

function Doodle({
  name,
  className,
  tone = "blue",
}: {
  name: DoodleName;
  className?: string;
  tone?: "blue" | "gold";
}) {
  const { row, col } = DOODLE_SPRITES[name];
  const x = (col / 3) * 100 + 8;
  const y = (row / 2) * 100 + 12;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-[1] block aspect-[384/341] overflow-hidden bg-transparent bg-no-repeat opacity-45 mix-blend-multiply select-none",
        tone === "blue"
          ? "[filter:hue-rotate(165deg)_saturate(1.7)_brightness(0.92)]"
          : "[filter:hue-rotate(320deg)_saturate(1.8)_brightness(1.05)]",
        className,
      )}
    >
      <span
        className="block h-full w-full bg-no-repeat"
        style={{
          backgroundImage: `url(${doodlePack.src})`,
          backgroundPosition: `${x}% ${y}%`,
          backgroundSize: "400% 300%",
        }}
      />
    </span>
  );
}

function SuperListingsContentBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-[#f7fbff]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(11,99,246,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,99,246,0.07)_1px,transparent_1px)] bg-[size:44px_44px] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(11,99,246,0.1),transparent_28%),radial-gradient(circle_at_88%_38%,rgba(245,181,27,0.12),transparent_24%),radial-gradient(circle_at_30%_86%,rgba(11,99,246,0.08),transparent_28%)]" />

      <Doodle
        name="sparkle"
        tone="gold"
        className="-left-10 top-8 hidden w-36 sm:block lg:left-8 lg:w-44"
      />
      <Doodle
        name="arrow"
        className="right-5 top-20 hidden w-44 md:block lg:right-16"
      />
      <Doodle name="wavyLine" className="-right-12 top-[38%] w-44 md:w-60" />
      <Doodle
        name="stickyNote"
        tone="gold"
        className="-left-14 bottom-32 hidden w-48 md:block"
      />

      <Doodle
        name="cornerDots"
        tone="gold"
        className="right-10 bottom-8 hidden w-32 sm:block"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function SuperListingCard({ listing }: { listing: SuperListingData }) {
  return (
    <Card className="flex min-h-[255px] min-w-[220px] flex-col rounded-xl border-gray-200 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-medium lg:min-w-0">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {listing.logo}
        </span>
        <p className="[font-family:var(--font-paraluman-heading)] text-sm font-bold text-[#071f49]">
          {listing.company}
        </p>
      </div>
      <h3 className="[font-family:var(--font-paraluman-heading)] text-base font-bold leading-snug tracking-[-0.025em] text-[#071f49]">
        {listing.title}
      </h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {listing.tags.map((tag) => (
          <span
            key={`${listing.company}-${tag}`}
            className="rounded-[0.33em] bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600"
          >
            {tag}
          </span>
        ))}
      </div>
      <Link
        href={listing.href}
        className="mt-auto inline-flex items-center gap-1 pt-6 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-blue-600 hover:text-blue-700"
      >
        View challenge
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function SuperListingsPreview() {
  return (
    <section className="bg-transparent px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
      <div className="mx-auto max-w-[1120px]">
        <div className="relative mb-8 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.64)_48%,rgba(255,255,255,0)_78%)] blur-2xl" />
          <div className="relative z-10">
            <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Super Listings
            </p>
            <h2 className="[font-family:var(--font-paraluman-heading)] mt-3 text-[clamp(2.2rem,4.6vw,3.6rem)] font-black leading-[0.98] tracking-[-0.06em] text-[#052338]">
              Find your <span className="text-[#0D6BFF]">challenge</span>
            </h2>
          </div>
        </div>

        <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
          {previewListings.map((listing) => (
            <div key={listing.company} className="snap-start lg:min-w-0">
              <SuperListingCard listing={listing} />
            </div>
          ))}
        </div>

        <Link
          href="/super-listing/search"
          className="mx-auto mt-8 flex w-fit items-center justify-center gap-1 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          View all challenges
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function HowItWorksStep({ step }: { step: StepData }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 [font-family:var(--font-paraluman-heading)] text-base font-bold text-white shadow-soft">
        {step.step}
      </span>
      <div className="mb-5 text-blue-600">{step.icon}</div>
      <h3 className="[font-family:var(--font-paraluman-heading)] text-lg font-bold tracking-[-0.025em] text-[#071f49]">
        {step.title}
      </h3>
      <p className="mt-2 max-w-[230px] text-sm font-medium leading-relaxed text-[#28466f]">
        {step.description}
      </p>
    </div>
  );
}

function StatsRow() {
  return (
    <div className="grid gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={`${stat.value}-${stat.label}`}
          className="flex items-center justify-center gap-4 text-left"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            {stat.icon}
          </span>
          <div>
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-bold leading-tight tracking-[-0.025em] text-[#071f49]">
              {stat.value}
            </p>
            <p className="text-sm font-medium leading-tight text-[#28466f]">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-transparent px-4 py-12 sm:px-6 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-14 flex items-center gap-3">
          <h2 className="[font-family:var(--font-paraluman-heading)] text-3xl font-bold tracking-[-0.04em] text-[#071f49]">
            How it works
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {howItWorksSteps.map((step, index) => (
            <div key={step.step} className="relative">
              <HowItWorksStep step={step} />
              {index < howItWorksSteps.length - 1 ? (
                <ArrowRight
                  className="absolute right-[-18px] top-24 hidden h-7 w-7 text-blue-600 md:block"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ))}
        </div>

        <StatsRow />
      </div>
    </section>
  );
}

function SuperListingsCTA() {
  return (
    <section className="bg-transparent px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-[1120px]">
        <div
          className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-2xl bg-[#061b3d] bg-cover bg-center px-6 py-12 text-center shadow-strong sm:min-h-[290px] sm:px-10 lg:min-h-[320px] lg:px-16"
          style={{ backgroundImage: "url('/super-listings/bg2.png')" }}
        >
          <div
            className="absolute inset-0 bg-[#061b3d]/10"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
            <h2 className="[font-family:var(--font-paraluman-heading)] text-3xl font-bold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              Skills speak louder.
            </h2>
            <p className="[font-family:var(--font-paraluman-handwriting)] text-5xl font-bold leading-tight text-amber-300 sm:text-7xl">
              Are you ready?
            </p>
            <Button
              asChild
              size="lg"
              className="mt-9 h-14 rounded-full bg-white px-8 [font-family:var(--font-paraluman-heading)] text-base font-bold text-[#0D6BFF] shadow-[0_0_34px_rgba(255,208,87,0.42),0_14px_36px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-white sm:h-16 sm:px-10"
            >
              <Link href="/super-listing/search">
                Explore challenges
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SuperListingsLandingPage() {
  return (
    <main
      className={cn(
        "min-h-screen overflow-x-hidden bg-white [font-family:var(--font-paraluman-body)]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
        handwritingFont.variable,
      )}
    >
      <SuperListingsHero />
      <SuperListingsContentBackdrop>
        <SuperListingsPreview />
        <HowItWorksSection />
        <SuperListingsCTA />
      </SuperListingsContentBackdrop>
      <style jsx global>{`
        @keyframes runway-shine {
          0% {
            background-position: 180% 50%;
          }
          100% {
            background-position: -40% 50%;
          }
        }

        .hero-note-spotlight {
          mix-blend-mode: screen;
        }

        @keyframes hero-sticky-note-swing {
          0% {
            transform: rotate(0deg);
          }
          24% {
            transform: rotate(4.8deg);
          }
          50% {
            transform: rotate(-3.8deg);
          }
          74% {
            transform: rotate(2deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .hero-sticky-note:is(:hover, :focus-visible) {
          opacity: 1;
          filter: saturate(1.04) brightness(1.05);
        }

        .hero-sticky-note:is(:hover, :focus-visible) .hero-note-spotlight {
          opacity: 1;
        }

        .hero-sticky-note:is(:hover, :focus-visible) .hero-sticky-note-paper {
          animation: hero-sticky-note-swing 0.95s
            cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: 50% 0;
        }
      `}</style>
    </main>
  );
}
