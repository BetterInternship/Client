"use client";

import Image from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import { ArrowRight, ArrowUpRight, Clock3, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cebuPacificPrimaryListing, cebuPacificProfile } from "./data";
import cebuPacificLogo from "../../super-listing/cebu-pacific/logo.png";

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

const REASONS_TO_APPLY = [
  {
    title: "Real product exposure",
    description:
      "Work on real passenger problems, not made-up internship exercises.",
  },
  {
    title: "Challenge-first format",
    description:
      "Cebu Pacific looks at how you think, decide, and execute before anything else.",
  },
  {
    title: "Ownership early",
    description: cebuPacificProfile.internCulture.body,
  },
];

const DISPLAY_LISTINGS = [
  {
    title: cebuPacificPrimaryListing.title,
    href: "/student/super-listing/cebu-pacific",
    status: "Open now",
  },
  {
    title: "Digital Experience Intern",
    href: "/student/super-listing/cebu-pacific",
    status: "Open now",
  },
  {
    title: "Operations Innovation Intern",
    href: "/student/super-listing/cebu-pacific",
    status: "Open now",
  },
];

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80";
const BEST_PLACE_TO_WORK_BADGE_URL =
  "https://greatplacetowork.com.ph/wp-content/uploads/2024/04/Apr2024Apr2025PHL-1.png";
const IMPACT_IMAGE_URL =
  "https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1400&q=80";
const INTERNSHIP_IMAGE_URL =
  "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1400&q=80";
const TEXT_GUTTER = "px-6 sm:px-10 lg:px-16 xl:px-24";

const HERO_BADGES = [
  {
    label: "No resume needed",
    icon: FileCheck2,
  },
  {
    label: "Hear back in 24 hours",
    icon: Clock3,
  },
];

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.25rem,2.4vw,1.8rem)] font-black tracking-[-0.01em] text-[#123f6b]">
        {title}
      </p>
      <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-[#173f69] via-[#2574BB] to-[#7fc0ff]" />
    </div>
  );
}

function SectionShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative border-t border-[#2574BB]/12 py-14 sm:py-16",
        className,
      )}
    >
      {children}
    </section>
  );
}

function InsetPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-[#2574BB]/12 bg-white shadow-[0_24px_60px_-44px_rgba(23,63,105,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionInner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(TEXT_GUTTER, className)}>{children}</div>;
}

function BrandBadge({
  label,
  icon: Icon,
  tone = "light",
  variant = "airline-tag",
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "light" | "dark";
  variant?:
    | "airline-tag"
    | "stamp"
    | "ticket-stub"
    | "seal"
    | "ribbon"
    | "orbit"
    | "ticker"
    | "chrome-chip"
    | "sticker";
}) {
  const isDark = tone === "dark";

  if (variant === "seal") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-[0.33em] border-2 px-4 py-3 shadow-[0_16px_34px_-22px_rgba(0,0,0,0.28)]",
          isDark
            ? "border-white/20 bg-[#0f2742] text-white"
            : "border-[#111827] bg-[#fffaf0] text-[#111827]",
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-[0.33em]",
            isDark ? "bg-[#123a63]" : "bg-[#111827]",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              isDark ? "text-[#ffd166]" : "text-[#fffaf0]",
            )}
          />
        </div>
        <div className="space-y-0.5">
          <p
            className={cn(
              "[font-family:var(--font-paraluman-mono)] text-[9px] font-bold uppercase tracking-[0.18em]",
              isDark ? "text-[#ffd166]" : "text-[#6b7280]",
            )}
          >
            Verified
          </p>
          <p className="[font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[-0.01em]">
            {label}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "ribbon") {
    return (
      <div
        className={cn(
          "relative inline-flex items-center gap-3 rounded-[0.33em] px-4 py-3 pr-6 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.24)]",
          isDark ? "bg-[#ff6b6b] text-white" : "bg-[#ff6b6b] text-white",
        )}
      >
        <div className="absolute -right-3 top-0 h-full w-6 bg-inherit [clip-path:polygon(0_0,100%_50%,0_100%)]" />
        <Icon className="relative z-10 h-4 w-4 text-white" />
        <p className="relative z-10 [font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[-0.01em]">
          {label}
        </p>
      </div>
    );
  }

  if (variant === "orbit") {
    return (
      <div className="inline-flex items-center gap-3 rounded-[0.33em] px-1 py-1">
        <div
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-full",
            isDark ? "bg-white/10" : "bg-[#111827]",
          )}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full ring-2",
              isDark ? "ring-[#8fceff]/40" : "ring-[#22d3ee]/45",
            )}
          />
          <Icon
            className={cn(
              "relative z-10 h-4 w-4",
              isDark ? "text-[#8fceff]" : "text-[#67e8f9]",
            )}
          />
        </div>
        <div className="space-y-0.5">
          <p
            className={cn(
              "[font-family:var(--font-paraluman-mono)] text-[9px] font-bold uppercase tracking-[0.18em]",
              isDark ? "text-[#8fceff]" : "text-[#0891b2]",
            )}
          >
            Priority
          </p>
          <p
            className={cn(
              "[font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[-0.01em]",
              isDark ? "text-white" : "text-[#111827]",
            )}
          >
            {label}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "ticker") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-[0.33em] border px-4 py-3",
          isDark
            ? "border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.08)_100%)] text-white"
            : "border-[#d7e3f0] bg-[linear-gradient(180deg,rgba(244,249,255,0.98)_0%,rgba(231,241,251,0.94)_100%)] text-[#173f69] shadow-[0_12px_24px_-22px_rgba(23,63,105,0.18)]",
        )}
      >
        <Icon
          className={cn("h-4 w-4", isDark ? "text-white" : "text-[#173f69]")}
        />
        <p
          className={cn(
            "[font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[-0.01em]",
            isDark ? "text-white" : "text-[#173f69]",
          )}
        >
          {label}
        </p>
      </div>
    );
  }

  if (variant === "chrome-chip") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-[0.33em] border px-4 py-3 shadow-[0_16px_34px_-24px_rgba(71,85,105,0.35)]",
          isDark
            ? "border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(148,163,184,0.12)_100%)] text-white"
            : "border-[#cbd5e1] bg-[linear-gradient(180deg,#ffffff_0%,#e2e8f0_100%)] text-[#0f172a]",
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-[0.33em] border",
            isDark
              ? "border-white/10 bg-white/10"
              : "border-[#cbd5e1] bg-white/80",
          )}
        >
          <Icon
            className={cn("h-4 w-4", isDark ? "text-white" : "text-[#334155]")}
          />
        </div>
        <p className="[font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[-0.01em]">
          {label}
        </p>
      </div>
    );
  }

  if (variant === "sticker") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-[0.33em] border-2 px-4 py-3 shadow-[0_14px_30px_-22px_rgba(0,0,0,0.22)] rotate-[-1deg]",
          isDark
            ? "border-white bg-[#facc15] text-[#111827]"
            : "border-[#111827] bg-[#facc15] text-[#111827]",
        )}
      >
        <Icon className="h-4 w-4" />
        <p className="[font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[-0.01em]">
          {label}
        </p>
      </div>
    );
  }

  if (variant === "stamp") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-[0.33em] border px-4 py-3",
          isDark
            ? "border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.08)_100%)] text-white"
            : "border-[#2574BB]/12 bg-[linear-gradient(180deg,rgba(244,249,255,0.98)_0%,rgba(234,244,255,0.9)_100%)] text-[#173f69] shadow-[0_14px_30px_-24px_rgba(23,63,105,0.18)]",
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border",
            isDark
              ? "border-white/12 bg-white/14"
              : "border-[#2574BB]/10 bg-white/80",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              isDark ? "text-[#8fceff]" : "text-[#2574BB]",
            )}
          />
        </div>
        <div className="space-y-0.5">
          <p
            className={cn(
              "[font-family:var(--font-paraluman-mono)] text-[9px] font-bold uppercase tracking-[0.18em]",
              isDark ? "text-[#8fceff]" : "text-[#2574BB]",
            )}
          >
            BetterInternship
          </p>
          <p
            className={cn(
              "[font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[-0.01em]",
              isDark ? "text-white" : "text-[#173f69]",
            )}
          >
            {label}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "ticket-stub") {
    return (
      <div
        className={cn(
          "relative inline-flex items-center gap-3 overflow-hidden rounded-[0.33em] border px-4 py-3",
          isDark
            ? "border-white/16 bg-white/8 text-white"
            : "border-[#d7e3f0] bg-white/94 text-[#173f69] shadow-[0_12px_24px_-22px_rgba(23,63,105,0.18)]",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-2",
            isDark ? "bg-white/20" : "bg-[#173f69]",
          )}
        />
        <div
          className={cn(
            "ml-1 flex h-9 w-9 items-center justify-center rounded-[0.33em]",
            isDark ? "bg-white/8" : "bg-[#f4f8fc]",
          )}
        >
          <Icon
            className={cn("h-4 w-4", isDark ? "text-white" : "text-[#173f69]")}
          />
        </div>
        <p
          className={cn(
            "[font-family:var(--font-paraluman-mono)] text-[10px] font-bold uppercase tracking-[0.18em]",
            isDark ? "text-white" : "text-[#173f69]",
          )}
        >
          {label}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-3 overflow-hidden rounded-[0.33em] border px-4 py-3 backdrop-blur-sm",
        isDark
          ? "border-white/16 bg-white/10 text-white"
          : "border-[#2574BB]/16 bg-white/90 text-[#173f69] shadow-[0_14px_30px_-24px_rgba(23,63,105,0.22)]",
      )}
    >
      {!isDark && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_45%)]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#2574BB_0%,#7fc0ff_100%)]" />
        </>
      )}
      <div
        className={cn(
          "relative z-10 flex h-9 w-9 items-center justify-center rounded-[0.33em] border",
          isDark
            ? "border-white/10 bg-white/12"
            : "border-[#2574BB]/10 bg-[#eef6ff]",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            isDark ? "text-[#8fceff]" : "text-[#2574BB]",
          )}
        />
      </div>
      <div className="relative z-10">
        <p
          className={cn(
            "[font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[-0.01em]",
            isDark ? "text-white" : "text-[#173f69]",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function HeroPanel() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20 xl:px-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(127,192,255,0.22),transparent_24%),radial-gradient(circle_at_78%_76%,rgba(37,116,187,0.1),transparent_28%),linear-gradient(to_right,rgba(23,63,105,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,63,105,0.045)_1px,transparent_1px)] bg-[size:auto,auto,42px_42px,42px_42px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(225,239,252,0.8)_100%)]" />
          <div className="flex w-full max-w-3xl flex-col items-center space-y-8 text-center sm:space-y-9 lg:items-start lg:text-left">
            <Link
              href={cebuPacificProfile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-3 transition-opacity duration-300 hover:opacity-85"
            >
              <Image
                src={cebuPacificLogo}
                alt="Cebu Pacific"
                className="h-auto w-28 sm:w-36"
                priority
              />
              <span className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase text-[#2574BB] sm:text-xs sm:mt-2.5">
                Internships
              </span>
            </Link>

            <h1 className="[font-family:var(--font-paraluman-heading)] w-full max-w-[12ch] font-black leading-[0.88] text-black xl:max-w-[13ch]">
              <span className="mt-3 block bg-[linear-gradient(110deg,#0f4f8f_0%,#2574BB_22%,#eef7ff_36%,#2574BB_50%,#6fb7ff_64%,#1c5f9b_82%,#0f4f8f_100%)] bg-[length:220%_100%] bg-clip-text text-[clamp(2.2rem,6.6vw,5.4rem)] leading-[0.9] tracking-[-0.045em] text-transparent [animation:runway-shine_8s_ease-in-out_infinite] [filter:drop-shadow(0_10px_28px_rgba(37,116,187,0.22))]">
                We&apos;ll give you the runway.
              </span>
            </h1>

            <p className="max-w-3xl [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#173957]/80 sm:text-lg sm:leading-8">
              {cebuPacificProfile.subheadline}
            </p>

            <div className="flex flex-col items-center gap-3 pt-3 lg:items-start">
              <Button
                asChild
                className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-[0.33em] border-2 border-[#173f69] bg-[#173f69] px-8 [font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.09em] text-white transition-all duration-300 hover:bg-[#123456] hover:shadow-[0_24px_48px_-16px_rgba(23,63,105,0.6)] active:scale-95 sm:w-auto sm:px-12 sm:text-xl"
              >
                <Link href="/student/super-listing/cebu-pacific">
                  Start challenge
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <div className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#1f68a9]/65">
                No resume required, 24h response
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-[22rem] lg:min-h-screen">
          <Image
            src={HERO_IMAGE_URL}
            alt="Airplane wing above the clouds"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/50 via-[#173f69]/8 to-transparent" />
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
            <Image
              src={BEST_PLACE_TO_WORK_BADGE_URL}
              alt="Best Places to Work in the Philippines 2024-2025 badge"
              width={120}
              height={120}
              className="h-auto w-20 sm:w-24 lg:w-28"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
            <div className="flex flex-wrap gap-3">
              {HERO_BADGES.map((badge) => (
                <BrandBadge
                  key={`hero-image-${badge.label}`}
                  label={badge.label}
                  icon={badge.icon}
                  variant="ticker"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CebuPacificCompanyProfilePage() {
  return (
    <main
      className={cn(
        "relative isolate min-h-screen bg-[#f8fafe] text-black",
        "[&_*]:selection:bg-[#173f69]/20 [&_*]:selection:text-[#123f6b]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_12%,rgba(37,116,187,0.12),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(37,116,187,0.1),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(37,116,187,0.07),transparent_44%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)] bg-[size:46px_46px] opacity-28" />

      <section className="relative">
        <HeroPanel />
      </section>

      <style jsx>{`
        @keyframes runway-shine {
          0% {
            background-position: 180% 50%;
          }
          100% {
            background-position: -40% 50%;
          }
        }
      `}</style>

      <section className="">
        <SectionShell className="overflow-hidden border-t-0 bg-[#173f69]">
          <SectionInner className="flex w-full flex-col items-center gap-6 text-center lg:flex-row lg:justify-center lg:text-left">
            <div className="max-w-5xl space-y-3">
              <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(2rem,4.5vw,3.8rem)] font-light leading-[0.98] tracking-[-0.05em] text-white/70">
                Cebu Pacific was named one of the{" "}
                <span className="font-bold text-white">
                  Philippines&apos; Best Places to Work in
                </span>{" "}
                2025.
              </p>
              <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#8fceff]">
                Recognized by BusinessWorld
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                src={BEST_PLACE_TO_WORK_BADGE_URL}
                alt="Best Places to Work in the Philippines 2024-2025 badge"
                width={176}
                height={176}
                className="h-auto w-24 sm:w-28 lg:w-36"
              />
            </div>
          </SectionInner>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(143,206,255,0.22),transparent_30%)]" />
        </SectionShell>

        <SectionShell className="border-t-0">
          <SectionInner className="space-y-6">
            <InsetPanel className="overflow-hidden border-0 bg-transparent shadow-none">
              <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
                  <p className="[font-family:var(--font-paraluman-heading)] max-w-[20ch] text-[clamp(1.7rem,3.2vw,2.7rem)] font-black leading-[0.98] tracking-[-0.05em] text-[#173f69]">
                    You&apos;ll help improve travel for hundreds of thousands of
                    passengers.
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] text-base leading-8 text-[#173957]/82 sm:text-lg">
                    {cebuPacificProfile.about.body}
                  </p>
                  <div className="flex flex-wrap items-end gap-x-8 gap-y-4 pt-2">
                    <div>
                      <p className="[font-family:var(--font-paraluman-heading)] text-5xl font-black tracking-[-0.06em] text-[#123f6b] sm:text-6xl">
                        60+
                      </p>
                      <p className="[font-family:var(--font-paraluman-mono)] text-[10px] font-bold uppercase tracking-[0.18em] text-[#2574BB]">
                        Destinations
                      </p>
                    </div>
                    <div>
                      <p className="[font-family:var(--font-paraluman-heading)] text-5xl font-black tracking-[-0.06em] text-[#123f6b] sm:text-6xl">
                        14
                      </p>
                      <p className="[font-family:var(--font-paraluman-mono)] text-[10px] font-bold uppercase tracking-[0.18em] text-[#2574BB]">
                        Countries
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative min-h-[20rem]">
                  <Image
                    src={IMPACT_IMAGE_URL}
                    alt="Passengers walking through an airport terminal"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/35 via-transparent to-transparent" />
                </div>
              </div>
            </InsetPanel>
          </SectionInner>
        </SectionShell>

        <SectionShell className="border-t-0">
          <SectionInner className="space-y-6">
            <InsetPanel className="overflow-hidden border-0 bg-transparent shadow-none">
              <div className="grid lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
                <div className="relative min-h-[20rem]">
                  <Image
                    src={INTERNSHIP_IMAGE_URL}
                    alt="A Cebu Pacific airplane in flight"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173f69]/40 via-transparent to-transparent" />
                </div>
                <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
                  <div>
                    <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#2574BB]">
                      A message to interns
                    </p>
                    <p className="[font-family:var(--font-paraluman-heading)] max-w-[18ch] text-[clamp(1.7rem,3.2vw,2.7rem)] font-black leading-[0.98] tracking-[-0.05em] text-[#173f69]">
                      Built for interns who want real ownership early.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <p className="[font-family:var(--font-paraluman-mono)] pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2574BB]">
                        01
                      </p>
                      <p className="[font-family:var(--font-paraluman-body)] text-base leading-8 text-[#173957]/82 sm:text-lg">
                        Cebu Pacific uses a challenge-first format, so your
                        application is judged by how you define a problem, make
                        decisions, and follow through.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <p className="[font-family:var(--font-paraluman-mono)] pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2574BB]">
                        02
                      </p>
                      <p className="[font-family:var(--font-paraluman-body)] text-base leading-8 text-[#173957]/82 sm:text-lg">
                        If you get in, expect more ownership, faster feedback,
                        and work shaped around what you can actually contribute.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </InsetPanel>
          </SectionInner>
        </SectionShell>

        <SectionShell className="overflow-hidden bg-[#173f69]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(143,206,255,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:auto,auto,36px_36px,36px_36px] opacity-60" />
          <SectionInner className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(2rem,4vw,3.1rem)] font-black leading-[0.96] tracking-[-0.05em] text-white">
                What past interns remember most is the trust.
              </p>
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
              {cebuPacificProfile.testimonials.map((item) => (
                <article
                  key={item.name}
                  className="flex min-h-[18rem] flex-col justify-between rounded-[0.33em] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.08)_100%)] px-6 py-7 backdrop-blur-sm sm:px-7"
                >
                  <p className="text-white [font-family:var(--font-paraluman-body)] text-base leading-8">
                    "{item.quote}"
                  </p>
                  <div className="mt-6 border-t border-white/12 pt-4">
                    <p className="[font-family:var(--font-paraluman-heading)] text-base font-black uppercase tracking-[0.01em] text-white">
                      {item.name}
                    </p>
                    <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.1em] text-[#8fceff]">
                      {item.role}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </SectionInner>
        </SectionShell>

        <SectionShell className="overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#e5f1fb_42%,#d7eafb_100%)] py-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(127,192,255,0.24),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(23,63,105,0.12),transparent_24%),linear-gradient(to_right,rgba(23,63,105,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,63,105,0.05)_1px,transparent_1px)] bg-[size:auto,auto,44px_44px,44px_44px]" />
          <SectionInner className="relative space-y-5">
            <div className="flex flex-col items-center space-y-5 text-center">
              <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(2.8rem,6vw,5.4rem)] font-black leading-[0.9] tracking-[-0.065em] text-[#173f69]">
                Better internships start here.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {HERO_BADGES.map((badge) => (
                  <BrandBadge
                    key={badge.label}
                    label={badge.label}
                    icon={badge.icon}
                    variant="ticker"
                  />
                ))}
              </div>
            </div>
            <InsetPanel className="overflow-hidden rounded-[0.33em] border border-[#2574BB]/14 bg-white/92 shadow-[0_24px_60px_-40px_rgba(23,63,105,0.25)] backdrop-blur-sm">
              {DISPLAY_LISTINGS.map((listing, index) => (
                <article
                  key={listing.title}
                  className={cn(
                    "grid gap-5 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center",
                    index === 0 ? "bg-[#f4f9ff]" : "bg-white",
                    index !== DISPLAY_LISTINGS.length - 1 &&
                      "border-b border-[#2574BB]/14",
                  )}
                >
                  <div className="space-y-3">
                    <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black uppercase tracking-[-0.02em] text-[#123f6b] sm:text-2xl">
                      {listing.title}
                    </p>
                    <div className="h-px w-full max-w-24 bg-[#2574BB]/16" />
                  </div>
                  <Button
                    asChild
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2 rounded-none border-2 px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] transition-all duration-200 sm:w-auto",
                      index === 0
                        ? "border-[#173f69] bg-[#173f69] text-white hover:bg-[#123456]"
                        : "border-[#173f69] bg-transparent text-[#173f69] hover:bg-[#173f69] hover:text-white",
                    )}
                  >
                    <Link href={listing.href}>View listing</Link>
                  </Button>
                </article>
              ))}
            </InsetPanel>
          </SectionInner>
        </SectionShell>

        {/* <SectionShell className="bg-[linear-gradient(180deg,rgba(224,238,251,0.95)_0%,rgba(244,249,255,1)_100%)]">
          <SectionInner>
            <div className="flex flex-col gap-8 border-y border-[#173f69]/16 py-10 sm:py-12 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(2rem,4vw,3.25rem)] font-black uppercase tracking-[-0.04em] text-[#173f69]">
                  Want more opportunities like this?
                </p>
                <p className="mt-3 max-w-xl [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957]/68 sm:text-base">
                  Explore more companies and internship openings on
                  BetterInternship
                </p>
              </div>
              <div className="w-full sm:w-auto sm:text-right">
                <Button
                  asChild
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-none border-2 border-[#173f69] bg-[#173f69] px-6 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#123456] sm:w-auto"
                >
                  <Link href="/search">Explore internships</Link>
                </Button>
              </div>
            </div>
          </SectionInner>
        </SectionShell> */}
      </section>
    </main>
  );
}
