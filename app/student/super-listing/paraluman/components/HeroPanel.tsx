"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import paralumanLogo from "../logo.png";
import { Button } from "@/components/ui/button";

type HeroPanelProps = {
  hiringBadgeText: string;
  onHowToApply: () => void;
  showHowToApplyButton?: boolean;
};

export function HeroPanel({
  hiringBadgeText,
  onHowToApply,
  showHowToApplyButton = true,
}: HeroPanelProps) {
  const prefersReduce = useReducedMotion();
  const magnetRef = useRef<HTMLDivElement>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const magneticRange = 10;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduce) return;
    const element = magnetRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setTx(x * magneticRange * 2);
    setTy(y * magneticRange * 2);
  };

  const resetMagnet = () => {
    setTx(0);
    setTy(0);
  };

  return (
    <section className="relative px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8 text-center sm:space-y-10">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-amber-950 shadow-[0_8px_20px_-14px_rgba(217,119,6,0.45)] super-header-badge super-badge-gold sm:text-sm">
            <Zap className="h-4 w-4" />
            <span>{hiringBadgeText}</span>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <Link
              href="https://www.paraluman.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity duration-200 hover:opacity-85"
            >
              <Image
                src={paralumanLogo}
                alt="Paraluman"
                className="mx-auto h-auto w-[clamp(16rem,55vw,30rem)]"
                priority
              />
            </Link>
            <div className="inline-block rounded-[0.33em] border-2 border-[#72068c]/50 bg-white/80 px-5 py-2.5 sm:px-6 sm:py-3">
              <h1 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1rem,4vw,1.8rem)] font-black uppercase tracking-[-0.02em] text-[#72068c]">
                looking for: web dev interns
              </h1>
            </div>
          </div>

          {showHowToApplyButton && (
            <p className="mx-auto max-w-3xl [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/70 sm:text-base">
              <Link
                href="https://www.paraluman.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#72068c] transition-opacity duration-200 hover:opacity-80"
              >
                Paraluman
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>{" "}
              is a youth-led Philippine news platform making every story
              accessible in both English and Filipino.
              <span className="mt-8 block">
                Join our team to build and{" "}
                <span className="font-bold text-[#72068c]">
                  improve how articles are created, processed, and published
                </span>{" "}
                to reach thousands of readers.
              </span>
              <span className="mt-8 block">
                To learn more about us, check out{" "}
                <Link
                  href="https://www.paraluman.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#72068c] transition-opacity duration-200 hover:opacity-80"
                >
                  paraluman.com
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>{" "}
              </span>
            </p>
          )}

          {showHowToApplyButton && (
            <div className="pt-2">
              <motion.div
                ref={magnetRef}
                onMouseMove={handleMove}
                onMouseLeave={resetMagnet}
                initial={prefersReduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                animate={{ x: tx, y: ty, rotate: tx * 0.3 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 16,
                  mass: 0.5,
                }}
                viewport={{ once: true, margin: "-50px" }}
                className="inline-block w-full sm:w-auto"
              >
                <Button
                  type="button"
                  onClick={onHowToApply}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#72068c] bg-gradient-to-r from-[#72068c] to-[#5a0570] px-8 [font-family:var(--font-paraluman-heading)] text-base font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg sm:h-16 sm:w-auto sm:px-10 sm:text-lg"
                >
                  How to apply
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
