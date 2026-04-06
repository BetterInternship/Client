"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
    <section className="relative flex min-h-[calc(100svh-9.5rem)] w-full flex-col items-center justify-center overflow-hidden pt-20 sm:min-h-[calc(100svh-10.5rem)] sm:pt-20 lg:min-h-[calc(100svh-11rem)]">
      <div className="relative w-full">
        <div className="flex flex-col items-center space-y-12 text-center sm:space-y-20">
          <Link
            href="https://www.cebupacificair.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto inline-flex w-fit transition-opacity duration-300 hover:opacity-85"
          >
            <Image
              src={cebuPacificLogo}
              alt="Cebu Pacific"
              className="h-auto w-40 sm:w-48"
              priority
            />
          </Link>

          <div className="w-full">
            <div className="relative mx-auto inline-block">
              <h1 className="absolute left-1/2 top-0 z-20 w-fit -translate-x-1/2 rounded-full border border-[#2574BB]/30 bg-white/90 px-4 py-1 [font-family:var(--font-paraluman-heading)] text-sm font-semibold leading-none tracking-[-0.01em] text-[#2574BB] shadow-[0_14px_28px_-22px_rgba(37,116,187,0.7)] sm:px-5 sm:py-1.5 sm:text-xl">
                We&apos;re looking for
              </h1>
              <p className="[font-family:var(--font-paraluman-heading)] pt-8 sm:pt-10">
                <span className="inline bg-[#f3d98a] px-3 text-5xl font-black leading-[1.02] tracking-[-0.02em] text-[#1f68a9] shadow-[0_16px_34px_-20px_rgba(243,217,138,0.8)] box-decoration-clone sm:text-7xl lg:text-8xl">
                  Product & Web Interns
                </span>
              </p>
            </div>
          </div>

          <div className="w-fit">
            <p className="[font-family:var(--font-paraluman-heading)] min-h-[3em] text-3xl font-black leading-relaxed tracking-[-0.01em] text-[#1f3a55]/95 sm:min-h-[1.4em] sm:text-[2.8rem]">
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
        </div>
      </div>

      {showHowToApplyButton && (
        <div className="mt-auto flex flex-col items-center pb-0">
          <button
            type="button"
            onClick={onHowToApply}
            aria-label="Scroll to overview"
            className="group flex flex-col items-center transition-all duration-300 hover:brightness-125"
          >
            <span className="rounded-full border border-[#2574BB]/30 bg-[#2574BB]/90 px-4 py-1 [font-family:var(--font-paraluman-heading)] text-sm font-semibold leading-none tracking-[-0.01em] text-white shadow-[0_14px_28px_-22px_rgba(37,116,187,0.7)] sm:px-5 sm:py-1.5 sm:text-xl">
              No resume required, 24h response
            </span>
            <span className="mt-1 inline-flex items-center justify-center text-[#2574BB] transition-colors duration-300 group-hover:text-[#1c5a92]">
              <ChevronDown className="h-8 w-8 animate-[cebuArrowFloat_1.8s_ease-in-out_infinite] stroke-[2.8] [stroke-linecap:butt] [stroke-linejoin:miter] sm:h-12 sm:w-12" />
            </span>
          </button>
        </div>
      )}
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

        @keyframes cebuArrowFloat {
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
