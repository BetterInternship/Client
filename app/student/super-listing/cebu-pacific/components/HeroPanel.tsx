"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import cebuPacificLogo from "../logo.png";

type HeroPanelProps = {
  onHowToApply: () => void;
  showHowToApplyButton?: boolean;
};

const HERO_TYPED_PHRASES = [
  "for everyJuan",
  "for Filipino travelers",
  "for people going home",
];

export function HeroPanel({
  onHowToApply,
  showHowToApplyButton = true,
}: HeroPanelProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = HERO_TYPED_PHRASES[phraseIndex];

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
      setPhraseIndex((previous) => (previous + 1) % HERO_TYPED_PHRASES.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [phraseIndex, typedText, isDeleting]);

  return (
    <section className="relative mx-auto flex min-h-[68vh] max-w-5xl items-center justify-center overflow-hidden sm:min-h-[72vh] lg:min-h-[78vh]">
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-center space-y-8 text-center sm:space-y-16">
          <Link
            href="https://www.cebupacificair.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto inline-flex w-fit transition-opacity duration-300 hover:opacity-85"
          >
            <Image
              src={cebuPacificLogo}
              alt="Cebu Pacific"
              className="h-auto w-32 sm:w-40"
              priority
            />
          </Link>

          <div className="mx-auto w-full max-w-[min(92vw,940px)] ">
            <div className="relative mx-auto inline-block">
              <h1 className="absolute left-1/2 top-0 z-20 w-fit -translate-x-1/2 rounded-full border border-[#2574BB]/30 bg-white/90 px-4 py-1 [font-family:var(--font-paraluman-heading)] text-sm font-semibold leading-none tracking-[-0.01em] text-[#2574BB] shadow-[0_14px_28px_-22px_rgba(37,116,187,0.7)] sm:px-5 sm:py-1.5 sm:text-lg">
                We&apos;re looking for
              </h1>
              <p className="[font-family:var(--font-paraluman-heading)] pt-8 sm:pt-10">
                <span className="inline bg-[#f3d98a] px-3 text-5xl font-black leading-[1.02] tracking-[-0.02em] text-[#1f68a9] shadow-[0_16px_34px_-20px_rgba(243,217,138,0.8)] box-decoration-clone sm:text-7xl lg:text-8xl">
                  Product & Web Interns
                </span>
              </p>
            </div>
          </div>

          <div className="mx-auto w-fit max-w-3xl">
            <p className="[font-family:var(--font-paraluman-heading)] min-h-[3em] text-2xl font-black leading-relaxed tracking-[-0.01em] text-[#1f3a55]/95 sm:min-h-[1.4em] sm:text-3xl">
              <span className="block sm:inline">Build better travel</span>
              <span
                className={`inline-flex items-center ${
                  typedText.length > 0 ? "sm:ml-2" : ""
                }`}
              >
                <span
                  className={`inline-flex min-h-[1em] items-center px-1 leading-[1em] ${
                    typedText.length > 0
                      ? "bg-[#2574BB]/20 text-[#1f3a55]/95"
                      : "bg-transparent text-transparent"
                  }`}
                >
                  {typedText || "\u00A0"}
                </span>
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-[1em] w-[2px] self-center bg-[#1f68a9]/60"
                  style={{
                    animation: "cebuCaretBlink 1.05s steps(1, end) infinite",
                  }}
                />
              </span>
            </p>
          </div>

          {showHowToApplyButton && (
            <div className="flex flex-col items-center gap-3 pt-3">
              <Button
                type="button"
                onClick={onHowToApply}
                className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-8 [font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.09em] text-white transition-all duration-300 hover:bg-[#1c5a92] hover:shadow-[0_24px_48px_-16px_rgba(37,116,187,0.62)] active:scale-95 sm:w-auto sm:px-12 sm:text-xl"
              >
                See Full Overview
                <ArrowDown className="h-5 w-5" />
              </Button>
              <p className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#6f5200]/80">
                No resume required, 24h response
              </p>
            </div>
          )}
        </div>
        <style jsx>{`
          @keyframes cebuCaretBlink {
            0%,
            49% {
              opacity: 1;
            }
            50%,
            100% {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
