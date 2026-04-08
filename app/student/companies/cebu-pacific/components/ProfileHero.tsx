"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { CebuPacificProfile } from "../data";
import cebuPacificLogo from "../../../super-listing/cebu-pacific/logo.png";

type ProfileHeroProps = {
  profile: CebuPacificProfile;
  onScrollToContent: () => void;
};

export function ProfileHero({ profile, onScrollToContent }: ProfileHeroProps) {
  const router = useRouter();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const featuredListing = profile.listings.super[0];
  const normalListing = profile.listings.normal[0];

  useEffect(() => {
    const currentPhrase = profile.rotatingPhrases[phraseIndex];

    const delay = (() => {
      if (!isDeleting && typedText === currentPhrase) return 2100;
      if (isDeleting && typedText.length === 0) return 450;
      return isDeleting ? 22 : 42;
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
        (previous) => (previous + 1) % profile.rotatingPhrases.length,
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [isDeleting, phraseIndex, profile.rotatingPhrases, typedText]);

  return (
    <section className="relative flex min-h-[94svh] items-center overflow-hidden px-6 py-8 pb-24 sm:px-8 sm:py-10 sm:pb-28 lg:px-10">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center bg-no-repeat "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80')",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-white opacity-90" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(37,116,187,0.55),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(243,217,138,0.24),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(10,39,66,0.36),transparent_44%)] opacity-80"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-center">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center space-y-20 text-center">
          <Link
            href={profile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit transition-opacity duration-300 hover:opacity-85"
          >
            <Image
              src={cebuPacificLogo}
              alt="Cebu Pacific"
              className="h-auto w-64  sm:w-72 lg:w-80"
              priority
            />
          </Link>

          <div className="space-y-2">
            <p className="[font-family:var(--font-cebu-company-heading)] text-5xl font-black leading-[0.95] tracking-[-0.03em]  [text-shadow:0_12px_28px_rgba(14,35,56,0.42)] sm:text-6xl lg:text-[5.3rem] text-black/80">
              Build better travel
            </p>
            <p className="[font-family:var(--font-cebu-company-heading)] min-h-[1.2em] text-4xl font-black leading-[0.95] tracking-[-0.03em] text-white [text-shadow:0_12px_28px_rgba(14,35,56,0.28)] sm:text-5xl lg:text-[6rem]">
              <span className="inline-flex items-center">
                <span
                  className={`inline-flex min-h-[1em] items-center px-2 leading-[1em] ${
                    typedText.length > 0
                      ? "bg-[#f3d98a] text-[#1f68a9]"
                      : "bg-transparent text-transparent"
                  }`}
                >
                  {typedText || "\u00A0"}
                </span>
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-[1em] w-[2px] self-center bg-white/80"
                  style={{
                    animation:
                      "cebuCompanyCaretBlink 1.05s steps(1, end) infinite",
                  }}
                />
              </span>
            </p>
          </div>

          <div className="inline-flex items-center rounded-full  bg-white/ px-4 py-2 shadow-[0_14px_30px_-20px_rgba(6,24,40,0.42)] backdrop-blur-sm bg-[#1f68a9]/80">
            <span className="[font-family:var(--font-cebu-company-mono)] font-bold uppercase tracking-[0.18em] text-white">
              Hiring Interns
            </span>
          </div>

          <div className="w-full max-w-2xl rounded-[0.33rem] border border-white/90 bg-white px-5 py-4 text-left shadow-[0_28px_58px_-38px_rgba(10,30,48,0.42)] sm:px-6">
            <p className="[font-family:var(--font-cebu-company-mono)] text-xs font-bold uppercase tracking-[0.16em] text-[#617c95]">
              Opportunities
            </p>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() =>
                  router.push("/student/super-listing/cebu-pacific")
                }
                className="inline-flex items-center gap-2 text-left [font-family:var(--font-cebu-company-heading)] text-xl font-black tracking-[-0.02em] text-[#173957] transition-colors duration-200 hover:text-[#1f68a9] sm:text-2xl"
              >
                <span>{featuredListing.title}</span>
                <span aria-hidden="true" className="text-[#1f68a9]">
                  &gt;
                </span>
              </button>
              {normalListing && (
                <p className="[font-family:var(--font-cebu-company-heading)] text-xl font-black tracking-[-0.02em] text-[#173957]/78 sm:text-2xl gap items-center">
                  {normalListing.title}
                  <span aria-hidden="true" className="text-[#1f68a9] ml-2">
                    &gt;
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center sm:bottom-8">
        <button
          type="button"
          onClick={onScrollToContent}
          aria-label="Scroll to company content"
          className="pointer-events-auto group flex flex-col items-center transition-all duration-300 hover:brightness-200"
        >
          <span className="[font-family:var(--font-cebu-company-heading)] leading-none tracking-[-0.01em] opacity-80 sm:text-xl -mb-2 text-[#173957]">
            Explore Cebu Pacific
          </span>
          <span className="inline-flex items-center justify-center opacity-80 transition-colors duration-300 text-[#173957]">
            <ChevronDown className="h-8 w-8 animate-[cebuCompanyArrowFloat_1.8s_ease-in-out_infinite] stroke-[2.8] [stroke-linecap:butt] [stroke-linejoin:miter] sm:h-12 sm:w-12 " />
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes cebuCompanyCaretBlink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }

        @keyframes cebuCompanyArrowFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(6px);
          }
        }
      `}</style>
    </section>
  );
}
