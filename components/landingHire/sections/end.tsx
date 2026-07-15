"use client";

import MagneticButton from "@/components/ui/magnetic-button";
import { ArrowRight, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { InteractiveGridPattern } from "@/components/landingStudent/sections/1stSection/interactive-grid-pattern";
import {
  SUPPORT_EMAIL_LINK,
  SUPPORT_EMAIL,
  SUPPORT_FACEBOOK,
} from "@/constants";

export function EndSection() {
  return (
    <section className="relative py-16 md:py-24 px-6 md:px-8 overflow-hidden bg-gradient-to-b from-primary/0 to-primary/50">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <InteractiveGridPattern
          width={36}
          height={36}
          squares={[60, 40]}
          className="h-full w-full opacity-30 [mask-image:radial-gradient(120%_80%_at_50%_40%,black,transparent)]"
          squaresClassName="border border-gray-200/10"
        />
      </div>
      <div className="relative mx-auto max-w-7xl rounded-[0.33em] border bg-white/80 backdrop-blur-xl p-8 md:p-12 shadow-2xl space-y-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary mb-3">
              Start hiring in minutes
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Ready to make internship hiring easier?
            </h2>
            <p className="mt-4 text-muted-foreground text-base md:text-lg">
              Post roles, review applicants faster, and keep your whole pipeline
              in one place.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <MagneticButton className="w-fit">
              <Link href="/register">
                <Button
                  type="button"
                  variant="ghost"
                  className="bg-primary text-primary-foreground px-16 h-14 w-fit hover:shadow-2xl hover:shadow-primary/50 hover:bg-primary/90 hover:text-primary-foreground transition-all"
                >
                  Post a job now
                  <ArrowRight />
                </Button>
              </Link>
            </MagneticButton>
            <p className="text-sm text-muted-foreground">
              No setup fees. Free for companies.
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">
            Have a question or need help? Get in touch with us through our email
            or Facebook.
          </p>
          <a className="flex gap-2" href={SUPPORT_EMAIL_LINK}>
            <Mail /> <span>{SUPPORT_EMAIL}</span>
          </a>
          <a className="flex gap-2" href={SUPPORT_FACEBOOK}>
            <Facebook /> <span>{SUPPORT_FACEBOOK}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
