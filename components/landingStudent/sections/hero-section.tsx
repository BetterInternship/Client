"use client";

import { InteractiveGridPattern } from "@/components/landingStudent/sections/1stSection/interactive-grid-pattern";
import { Navigation } from "@/components/landingStudent/navigation";
import MagneticButton from "@/components/ui/magnetic-button";
import { Button } from "@betterinternship/components";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative isolate w-full overflow-hidden">
      {/* texture */}
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
        <InteractiveGridPattern
          width={36}
          height={36}
          squares={[60, 40]}
          className="h-full w-full opacity-30 mask-[radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
          squaresClassName="border border-gray-200/10"
        />
      </div>

      {/* orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <span
          className="absolute -top-16 -left-20 h-72 w-72 rounded-full
          bg-linear-to-br from-primary/25 to-blue-400/20 blur-xl sm:blur-3xl"
        />
        <span
          className="absolute -right-24 bottom-20 h-80 w-80 rounded-full
          bg-linear-to-br from-primary/25 to-blue-400/20 blur-xl sm:blur-3xl"
        />
      </div>

      {/* navigation */}
      <div className="absolute inset-x-0 top-0 z-40">
        <Navigation />
      </div>

      <section
        aria-labelledby="hero-heading"
        className="
          relative min-h-svh
          pt-[calc(env(safe-area-inset-top)+5rem)] [@media_(max-width:390px)]:pt-[calc(env(safe-area-inset-top)+5.75rem)] sm:pt-6
          flex flex-col items-center justify-center text-center
          gap-8 sm:gap-6
          px-4 sm:px-6
        "
      >
        <h1 className="flex flex-col items-center justify-center gap-2 sm:gap-4 text-7xl sm:9xl lg:text-[10rem] font-black tracking-tighter leading-none text-foreground select-none">
          {/* Line 1: [Badge 1] A better [Badge 2] */}
          <span className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <span className="inline-flex items-center justify-center h-[0.85em] px-[0.8em] rounded-[0.4em] bg-muted shrink-0">
              <img
                src="/illustrations/student.svg"
                alt=""
                className="h-full w-auto object-contain"
              />
            </span>
            <span>A better</span>
            <span className="inline-flex items-center justify-center h-[0.85em] px-[0.4em] rounded-[0.4em] bg-muted shrink-0"></span>
          </span>

          {/* Line 2: way [Badge 3] to [Badge 4] */}
          <span className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <span>way</span>
            <span className="inline-flex items-center justify-center h-[0.85em] px-[0.6em] rounded-[0.4em] bg-muted shrink-0">
              <img
                src="/illustrations/paper-plane.svg"
                alt=""
                className="h-full w-auto object-contain"
              />
            </span>
            <span>to</span>
            <span className="inline-flex items-center justify-center h-[0.85em] px-[0.8em] rounded-[0.4em] bg-muted shrink-0">
              <img
                src="/illustrations/laptop-user.svg"
                alt=""
                className="h-full w-auto object-contain"
              />
            </span>
          </span>

          {/* Line 3: intern. [Badge 5] */}
          <span className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <span className="text-primary">intern.</span>
            <span className="inline-flex items-center justify-center h-[0.85em] px-[0.6em] rounded-[0.4em] bg-muted shrink-0">
              <img
                src="/illustrations/checklist.svg"
                alt=""
                className="h-full w-auto object-contain"
              />
            </span>
          </span>
        </h1>
        <div className="flex gap-2 justify-start items-start max-w-9xl text-lg font-medium">
          <MagneticButton>
            <Button
              scheme="primary"
              size="lg"
              onClick={() => router.push("/search")}
            >
              <Search /> Browse jobs
            </Button>
          </MagneticButton>
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              router.push(`${process.env.NEXT_PUBLIC_CLIENT_HIRE_URL}/login`)
            }
          >
            Post a job
          </Button>
        </div>
      </section>
    </div>
  );
}
