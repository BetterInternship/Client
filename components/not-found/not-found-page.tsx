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
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center md:h-[100dvh] md:min-h-[420px]">
        <div
          className={
            fixedHeader ? "h-16 w-full shrink-0 md:h-20" : "w-full shrink-0"
          }
        >
          {header}
        </div>
        <section className="relative flex w-full max-w-[38rem] flex-1 flex-col items-center justify-center gap-5 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 text-center md:grid md:min-h-0 md:grid-rows-[auto_minmax(0,1fr)_minmax(0,2fr)_auto] md:justify-items-center md:gap-3 md:px-5 md:py-5">
          <h1 className="shrink-0 text-2xl font-normal leading-tight tracking-tight text-landing-navy sm:text-4xl">
            Page not found
          </h1>
          <img
            src="/404-number-sprite.png"
            alt="404"
            className="h-auto max-h-[16svh] w-[70%] max-w-[18rem] shrink-0 object-contain md:h-full md:min-h-0 md:w-full md:max-h-none md:max-w-none"
          />
          <img
            src={spriteSrc}
            alt={spriteAlt}
            className="h-auto max-h-[36svh] w-full max-w-[20rem] shrink-0 object-contain md:h-full md:min-h-0 md:max-h-none md:max-w-none"
          />
          <Link
            href="/"
            className="relative mt-2 inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-landing-blue px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-landing-blue/25 transition hover:-translate-y-0.5 hover:bg-landing-blue-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-blue md:mt-0"
          >
            Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}
