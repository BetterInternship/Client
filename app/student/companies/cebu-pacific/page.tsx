"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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

function HeroPanel() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPhrasePopping, setIsPhrasePopping] = useState(true);

  useEffect(() => {
    setIsPhrasePopping(true);
    const popTimer = window.setTimeout(() => setIsPhrasePopping(false), 340);
    return () => window.clearTimeout(popTimer);
  }, [phraseIndex]);

  useEffect(() => {
    const currentPhrase = cebuPacificProfile.rotatingPhrases[phraseIndex];

    const delay = (() => {
      if (!isDeleting && typedText === currentPhrase) return 1700;
      if (isDeleting && typedText.length === 0) return 350;
      return isDeleting ? 38 : 72;
    })();

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentPhrase.length) {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
          return;
        }

        setIsDeleting(true);
        return;
      }

      if (typedText.length > 0) {
        setTypedText(currentPhrase.slice(0, typedText.length - 1));
        return;
      }

      setIsDeleting(false);
      setPhraseIndex(
        (previous) =>
          (previous + 1) % cebuPacificProfile.rotatingPhrases.length,
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [phraseIndex, typedText, isDeleting]);

  return (
    <section className="relative mx-auto flex min-h-[68vh] max-w-5xl items-center justify-center overflow-hidden py-14 sm:min-h-[72vh] sm:py-20 lg:min-h-[78vh] lg:py-24">
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-center space-y-8 text-center sm:space-y-9">
          <Link
            href={cebuPacificProfile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto inline-flex w-fit transition-opacity duration-300 hover:opacity-85"
          >
            <Image
              src={cebuPacificLogo}
              alt="Cebu Pacific"
              className="h-auto w-28 sm:w-36"
              priority
            />
          </Link>

          <h1 className="[font-family:var(--font-paraluman-heading)] w-full max-w-none font-black leading-[0.86] text-black">
            <span className="block whitespace-nowrap text-[clamp(2.05rem,9.2vw,7.4rem)] leading-[0.88] tracking-[-0.045em] text-[#173f69]">
              Build better travel
            </span>
            <span className="mt-3 block min-h-[1.13em] whitespace-nowrap text-[clamp(2.05rem,9.2vw,7.4rem)] leading-[0.88] tracking-[-0.045em] text-[#2574BB] [text-shadow:0_10px_28px_rgba(37,116,187,0.25)]">
              <span
                className={
                  isPhrasePopping
                    ? "phrase-pop inline-flex items-end"
                    : "inline-flex items-end"
                }
              >
                <span>{typedText}</span>
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-[0.92em] w-[3px] translate-y-[0.08em] rounded-full bg-[#2574BB]"
                  style={{
                    animation: "caretBlink 1.05s steps(1, end) infinite",
                  }}
                />
              </span>
            </span>
          </h1>

          <p className="mx-auto max-w-3xl [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#173957]/80 sm:text-lg sm:leading-8">
            {cebuPacificProfile.subheadline}
          </p>

          <div className="flex flex-col items-center gap-3 pt-3">
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

        <style jsx>{`
          @keyframes caretBlink {
            0%,
            49% {
              opacity: 1;
            }
            50%,
            100% {
              opacity: 0;
            }
          }

          @keyframes phrasePop {
            0% {
              opacity: 0;
              transform: translateY(8px) scale(0.985);
              filter: blur(3px);
            }
            65% {
              opacity: 1;
              transform: translateY(0) scale(1.01);
              filter: blur(0);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          .phrase-pop {
            animation: phrasePop 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }
        `}</style>
      </div>
    </section>
  );
}

export default function CebuPacificCompanyProfilePage() {
  return (
    <main
      className={cn(
        "relative isolate min-h-screen bg-[#f8fafe] text-black",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_12%,rgba(37,116,187,0.12),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(37,116,187,0.1),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(37,116,187,0.07),transparent_44%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)] bg-[size:46px_46px] opacity-28" />

      <header className="top-0 z-[9999] flex items-center justify-between border-b border-transparent bg-transparent px-4 py-3 shadow-none backdrop-blur-0 transition-all duration-300 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2 sm:gap-3">
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

          <span className="text-xs font-semibold uppercase text-black/45">
            x
          </span>

          <Link
            href={cebuPacificProfile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity duration-200 hover:opacity-75"
          >
            <Image
              src={cebuPacificLogo}
              alt="Cebu Pacific"
              className="h-7 w-auto sm:h-8"
              priority
            />
          </Link>
        </div>
      </header>

      <section className="relative">
        <div className="px-2">
          <div className="mx-auto max-w-5xl">
            <HeroPanel />
          </div>
        </div>
      </section>

      <section className="px-2 pb-24">
        <div className="mx-auto max-w-5xl space-y-16 pt-4 sm:pt-8">
          <section className="relative overflow-hidden rounded-[0.33em] border border-[rgba(37,116,187,0.24)] bg-white px-6 py-6 shadow-[0_18px_34px_-26px_rgba(23,63,105,0.3)] sm:px-8 sm:py-7">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-[#173f69] via-[#2574BB] to-[#7fc0ff]" />
            <div className="space-y-3 pl-2 sm:pl-3">
              <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#2574BB]">
                Recognized by BusinessWorld
              </p>
              <p className="[font-family:var(--font-paraluman-heading)] max-w-4xl text-[clamp(1.45rem,3.6vw,2.35rem)] font-black leading-[1.02] tracking-[-0.04em] text-[#173f69]">
                Cebu Pacific was named one of the Philippines&apos; Best Places
                to Work in 2025.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <SectionTitle title="About Cebu Pacific" />
            <div className="relative overflow-hidden rounded-[0.33em] border border-[rgba(37,116,187,0.26)] bg-gradient-to-br from-[#173f69] via-[#1e5d96] to-[#2574BB] p-6 text-white shadow-[0_24px_56px_-30px_rgba(23,63,105,0.9)] sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2)_0%,transparent_32%,rgba(255,255,255,0.1)_58%,transparent_100%)]" />
              <div className="relative z-10 space-y-3">
                <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.4rem,3.2vw,2rem)] font-black uppercase tracking-[-0.02em] text-white">
                  {cebuPacificProfile.about.title}
                </p>
                <p className="mt-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-white sm:text-base">
                  {cebuPacificProfile.about.body}
                </p>
                <Button
                  asChild
                  className="mt-1 inline-flex h-11 items-center gap-2 rounded-[0.33em] border border-white/55 bg-white/12 px-4 [font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_26px_-18px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-[#173f69]"
                >
                  <Link
                    href={cebuPacificProfile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Cebu Pacific
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <SectionTitle title="Reasons to apply" />
            <div className="rounded-[0.33em] border border-[rgba(37,116,187,0.24)] bg-white p-5 shadow-[0_16px_30px_-22px_rgba(23,63,105,0.4)] sm:p-6">
              <div className="space-y-4">
                {REASONS_TO_APPLY.map((item, index) => (
                  <div
                    key={item.title}
                    className={cn(
                      "space-y-2",
                      index !== REASONS_TO_APPLY.length - 1 &&
                        "border-b border-[rgba(37,116,187,0.12)] pb-4",
                    )}
                  >
                    <h3 className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.01em] text-[#123f6b]">
                      {item.title}
                    </h3>
                    <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-6 text-black/75">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <SectionTitle title="Former intern voices" />
            <div className="grid gap-4 md:grid-cols-3">
              {cebuPacificProfile.testimonials.map((item) => (
                <article
                  key={item.name}
                  className="rounded-[0.33em] border border-[rgba(37,116,187,0.24)] bg-white p-5 shadow-[0_16px_30px_-22px_rgba(23,63,105,0.4)]"
                >
                  <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/75">
                    "{item.quote}"
                  </p>
                  <div className="mt-4 border-t border-[#2574BB]/12 pt-4">
                    <p className="[font-family:var(--font-paraluman-heading)] text-base font-black uppercase tracking-[0.01em] text-[#123f6b]">
                      {item.name}
                    </p>
                    <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-bold uppercase tracking-[0.1em] text-[#2574BB]">
                      {item.role}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <SectionTitle title="Listings" />
            <div className="rounded-[0.33em] border border-[rgba(37,116,187,0.24)] bg-white p-5 shadow-[0_16px_30px_-22px_rgba(23,63,105,0.4)] sm:p-6">
              <div className="space-y-4">
                {DISPLAY_LISTINGS.map((listing, index) => (
                  <article
                    key={listing.title}
                    className={cn(
                      "rounded-[0.33em] border border-[rgba(37,116,187,0.18)] bg-[#f8fbff] p-4 sm:p-5",
                      index !== DISPLAY_LISTINGS.length - 1 &&
                        "border-b-[rgba(37,116,187,0.18)]",
                    )}
                  >
                    <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
                      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                        <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black uppercase tracking-[-0.02em] text-[#123f6b]">
                          {listing.title}
                        </p>
                        <span className="rounded-full bg-[#173f69] px-3 py-1 [font-family:var(--font-paraluman-mono)] text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                          {listing.status}
                        </span>
                      </div>

                      {listing.href ? (
                        <Button
                          asChild
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#173f69] bg-[#173f69] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#123456] sm:w-auto"
                        >
                          <Link href={listing.href}>View listing</Link>
                        </Button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(37,116,187,0.45)] bg-gradient-to-br from-[#173f69] via-[#1e5d96] to-[#2574BB] p-6 text-white shadow-[0_24px_55px_-30px_rgba(23,63,105,0.88)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-white uppercase tracking-[-0.02em] sm:text-3xl">
                  Want more opportunities like this?
                </p>
                <p className="[font-family:var(--font-paraluman-mono)] text-[10px] leading-tight text-white/75 sm:text-[11px]">
                  Explore more companies and internship openings on
                  BetterInternship
                </p>
              </div>
              <div className="w-full sm:w-auto sm:text-right">
                <Button
                  asChild
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173f69] transition-all duration-200 hover:bg-white hover:shadow-lg sm:w-auto"
                >
                  <Link href="/search">Explore internships</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
