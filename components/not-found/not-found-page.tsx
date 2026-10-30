"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function NotFoundPage({
  header,
  spriteSrc = "/404-hero-sprite.png",
  spriteAlt = "Confused student looking for the right direction",
  fixedHeader = false,
}: {
  header: ReactNode;
  spriteSrc?: string;
  spriteAlt?: string;
  fixedHeader?: boolean;
}) {
  return (
    <main className="fixed inset-0 z-[9999] overflow-y-auto bg-white text-landing-navy">
      <div className="relative flex h-[100dvh] min-h-[420px] w-full flex-col items-center">
        <div
          className={
            fixedHeader ? "h-16 w-full shrink-0 md:h-20" : "w-full shrink-0"
          }
        >
          {header}
        </div>
        <section className="relative grid min-h-0 w-full max-w-[38rem] flex-1 grid-rows-[auto_minmax(0,1fr)_minmax(0,2fr)_auto] justify-items-center gap-3 px-5 py-5 text-center">
          <h1 className="text-3xl font-normal leading-tight tracking-tight text-landing-navy sm:text-4xl">
            Page not found
          </h1>
          <img
            src="/404-number-sprite.png"
            alt="404"
            className="h-full min-h-0 w-full object-contain"
          />
          <img
            src={spriteSrc}
            alt={spriteAlt}
            className="h-full min-h-0 w-full object-contain"
          />
          <Link
            href="/"
            className="relative rounded-full bg-landing-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-landing-blue/25 transition hover:-translate-y-0.5 hover:bg-landing-blue-hover"
          >
            Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}
