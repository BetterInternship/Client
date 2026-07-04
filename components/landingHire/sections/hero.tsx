"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex justify-center items-center overflow-hidden px-8">
      <div className="flex w-full max-w-7xl flex-col gap-8 md:flex-row items-center">
        <div className="flex flex-col gap-2 md:w-1/2">
          <img
            src="/BetterInternshipLogo.png"
            className="w-24 h-24 flex-shrink-0 aspect-square object-contain"
            alt="BetterInternship logo"
          ></img>
          <div className="flex flex-col">
            <h1 className="tracking-tighter font-bold leading-none">
              Hire interns <br />
              Faster. <br />
              Easier. <br />
              <span className="text-primary">Better.</span>
            </h1>
          </div>
          <p className="text-lg max-w-[90%]">
            Minimize your paperwork and automate your workflow on
            BetterInternship.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="h-14 bg-primary text-primary-foreground px-16 w-fit mt-4"
            onClick={() => router.push("/register")}
          >
            Post a job now
            <ArrowRight />
          </Button>
        </div>
        <div className="hidden lg:block lg:w-1/2 relative aspect-[4/3] w-full overflow-hidden rounded-[0.33em]">
          <Image
            src="/hire-landing-hero.jpg"
            alt="Interns collaborating in a modern office"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
