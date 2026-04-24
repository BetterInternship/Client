"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Globe } from "lucide-react";

type HowToApplyPanelProps = {
  challengePdfUrl?: string;
  onGoToApply: () => void;
};

type SectionTitleProps = {
  title: string;
};

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.35rem,2.6vw,2rem)] font-medium tracking-[-0.03em] text-[#173f69]">
      {title}
    </h2>
  );
}

export function HowToApplyPanel({
  challengePdfUrl,
  onGoToApply,
}: HowToApplyPanelProps) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8 first:border-t-0 first:pt-0">
        <div className="space-y-3">
          <h2 className="max-w-3xl [font-family:var(--font-paraluman-heading)] text-4xl font-bold leading-[1.25] tracking-[-0.04em] text-[#173f69] pb-1 border-b-[5px] w-fit border-b-[#173f69] border-opacity-80">
            Build a{" "}
            <span className="bg-[#f8d64e]/50 px-1">workable chamber app</span>
            <br /> that fixes slow matching and turns member data into action.
          </h2>
          <p className="max-w-3xl [font-family:var(--font-paraluman-body)] pt-4 text-base leading-7 text-[#173957] opacity-80 sm:text-lg sm:leading-8">
            PCC already has many member companies, but discovery and
            introductions are still too manual and too slow. The challenge is
            to structure company data, improve profile quality, and help members
            find relevant partners through a system that drives consistent
            participation.
          </p>
        </div>

        <div className="space-y-3 pt-5">
          <p className="[font-family:var(--font-paraluman-body)] font-semibold text-[#1f68a9]/64">
            Official links
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={challengePdfUrl || "https://www.philippinechamber.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#2574BB]/10 bg-white px-3 py-2 text-sm text-[#173f69] transition-colors hover:bg-[#edf5ff]"
            >
              <Globe className="h-4 w-4" />
              Website
            </a>
            <a
              href="https://www.dti.gov.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#2574BB]/10 bg-white px-3 py-2 text-sm text-[#173f69] transition-colors hover:bg-[#edf5ff]"
            >
              <ArrowUpRight className="h-4 w-4" />
              DTI
            </a>
            <a
              href="https://www.sec.gov.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#2574BB]/10 bg-white px-3 py-2 text-sm text-[#173f69] transition-colors hover:bg-[#edf5ff]"
            >
              <ArrowUpRight className="h-4 w-4" />
              SEC
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="Goal" />
        <ul className="space-y-3 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-80 sm:text-base">
          <li>Turn fragmented member data into profile-rich, usable records.</li>
          <li>Enable direct sign-up that reduces onboarding delays.</li>
          <li>Support faster member-to-member discovery and introductions.</li>
          <li>
            Design incentives so members keep profiles updated and respond to
            network requests.
          </li>
        </ul>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="What we're looking for" />
        <div className="space-y-4 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-80 sm:text-base">
          <p>
            <span className="font-semibold text-[#173f69]">Judgment.</span> Did
            you design a system that reduces dependence on manual admin routing?
          </p>
          <p>
            <span className="font-semibold text-[#173f69]">Depth.</span> Did you
            define profile data and grouping logic that improve matching quality?
          </p>
          <p>
            <span className="font-semibold text-[#173f69]">Execution.</span> Did
            you propose a workable points economy and end-to-end flow that keeps
            the network active?
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="Submission requirements" />
        <div className="space-y-4 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-80 sm:text-base">
          <p>
            A workable product concept or prototype that includes signup,
            profile quality, discovery, and connection flows.
          </p>
          <p>
            A clear gamification model with earnable/spendable points and
            examples of member actions that improve response behavior.
          </p>
          <p>
            Include this core loop: earn points by contributing (attending
            meetings/calls, sharing updates, answering inquiries), spend points
            for network value (e.g., qualified introductions, discovery
            actions), and earn points back for reliable participation.
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="Before you start" />
        <div className="space-y-4 bg-[rgba(250,243,220,0.84)] px-5 py-5 [font-family:var(--font-paraluman-body)] rounded-[0.33em] text-base leading-7 text-[#173957] opacity-80 sm:px-6 sm:py-6 sm:text-lg sm:leading-8">
          <p>
            Bottom line: make this network easier to join, easier to trust, and
            faster to get value from.
          </p>
          <p>
            Your solution should feel like a live coordination engine, not just
            a static member list.
          </p>
        </div>

        <div className="border-t border-[#2574BB]/12 bg-white/80 pt-5">
          <Button
            type="button"
            onClick={onGoToApply}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#173f69] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-white transition-all duration-200 hover:bg-[#123456]"
          >
            Submit work
          </Button>
        </div>
      </section>
    </div>
  );
}
