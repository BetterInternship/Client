"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import paralumanLogo from "../logo.png";
import { Button } from "@/components/ui/button";

type HeroPanelProps = {
  onHowToApply: () => void;
  showHowToApplyButton?: boolean;
};

const HERO_TYPED_PHRASES = [
  "Filipino journalism",
  "Filipino voices",
  "real stories",
  "stories that matter",
];

export function HeroPanel({
  onHowToApply,
  showHowToApplyButton = true,
}: HeroPanelProps) {
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
    const currentPhrase = HERO_TYPED_PHRASES[phraseIndex];

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
      setPhraseIndex((previous) => (previous + 1) % HERO_TYPED_PHRASES.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [phraseIndex, typedText, isDeleting]);

  return (
    <section className="relative mx-auto flex min-h-[68vh] max-w-5xl items-center justify-center overflow-hidden py-14 sm:min-h-[72vh] sm:py-20 lg:min-h-[78vh] lg:py-24">
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-center space-y-8 text-center sm:space-y-9">
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

          <h1 className="[font-family:var(--font-paraluman-heading)] w-full max-w-none font-black leading-[0.86] text-black">
            <span className="block whitespace-nowrap text-[clamp(2.05rem,9.2vw,7.4rem)] leading-[0.88] tracking-[-0.045em] text-black">
              Build tools for
            </span>
            <span className="mt-3 block min-h-[1.13em] whitespace-nowrap text-[clamp(2.05rem,9.2vw,7.4rem)] leading-[0.88] tracking-[-0.045em] text-[#72068c] [text-shadow:0_10px_28px_rgba(114,6,140,0.25)]">
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
                  className="ml-1 inline-block h-[0.92em] w-[3px] translate-y-[0.08em] rounded-full bg-[#72068c]"
                  style={{
                    animation: "caretBlink 1.05s steps(1, end) infinite",
                  }}
                />
              </span>
            </span>
          </h1>

          <div className="mx-auto inline-flex w-fit rounded-[0.33em] border border-[#72068c]/25 bg-white/70 px-4 py-2 backdrop-blur-sm">
            <span className="[font-family:var(--font-paraluman-mono)] font-black uppercase text-[#72068c]">
              Looking for: Web Development Interns
            </span>
          </div>

          {showHowToApplyButton && (
            <div className="flex flex-col items-center gap-3 pt-3">
              <Button
                type="button"
                onClick={onHowToApply}
                className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-[0.33em] border-2 border-[#72068c] bg-[#72068c] px-8 [font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.09em] text-white transition-all duration-300 hover:bg-[#5a0570] hover:shadow-[0_24px_48px_-16px_rgba(114,6,140,0.6)] active:scale-95 sm:w-auto sm:px-12 sm:text-xl"
              >
                Start Challenge
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8 [font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#5d0476]/60">
                No resume required, 24h response
              </div>
            </div>
          )}
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
