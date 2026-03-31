"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import anterioreLogo from "../logo.png";

type HeroPanelProps = {
  hiringBadgeText: string;
  siteUrl: string;
  onHowToApply: () => void;
  showHowToApplyButton?: boolean;
};

export function HeroPanel({
  hiringBadgeText,
  siteUrl,
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
    <section className="relative px-6 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8 text-center sm:space-y-10">
        <div className="flex justify-center">
          <div className="super-header-badge super-badge-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-amber-950 shadow-[0_8px_20px_-14px_rgba(217,119,6,0.45)] sm:text-sm">
            <Zap className="h-4 w-4" />
            <span>{hiringBadgeText}</span>
            <Zap className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <Link
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity duration-200 hover:opacity-85"
            >
              <Image
                src={anterioreLogo}
                alt="Anteriore"
                className="mx-auto h-auto w-[clamp(16rem,52vw,32rem)] [filter:brightness(0)_saturate(100%)_invert(21%)_sepia(17%)_saturate(1612%)_hue-rotate(184deg)_brightness(88%)_contrast(93%)]"
                priority
              />
            </Link>
            <div className="mt-6 inline-block rounded-[0.33em] border-2 border-[#274b7d]/50 bg-white/85 px-5 py-2.5 sm:px-6 sm:py-3">
              <p className="[font-family:var(--font-anteriore-heading)] text-[clamp(1rem,4vw,1.8rem)] font-black uppercase tracking-[-0.02em] text-[#274b7d]">
                looking for: web dev interns
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-3xl space-y-3 [font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/70 sm:text-base">
            <p className="">
              <Link
                href="https://www.anteriore.com.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#274b7d] transition-opacity duration-200 hover:opacity-80"
              >
                Anteriore
              </Link>{" "}
              is a startup that delivers tailor-made IT services that drive
              businesses forward.
            </p>
            <p className="">
              To learn more about us, check out{" "}
              <Link
                href="https://anteriore.com.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#274b7d] transition-opacity duration-200 hover:opacity-80 hover:underline"
              >
                anteriore.com.ph
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>

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
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#274b7d] bg-gradient-to-r from-[#274b7d] to-[#1b3458] px-8 [font-family:var(--font-anteriore-heading)] text-base font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg sm:h-16 sm:w-auto sm:px-10 sm:text-lg"
                >
                  How to apply
                </Button>
              </motion.div>
              <p className="mt-3 text-center [font-family:var(--font-anteriore-mono)] text-[10px] leading-tight text-black/45 sm:text-[11px]">
                No resume needed. Response in 24 hours
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
