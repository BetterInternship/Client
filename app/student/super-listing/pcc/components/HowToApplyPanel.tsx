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
            <br /> that turns member data into real network value.
          </h2>
          <p className="max-w-3xl [font-family:var(--font-paraluman-body)] pt-4 text-base leading-7 text-[#173957] opacity-80 sm:text-lg sm:leading-8">
            The Philippine Chamber of Commerce already has many members. The
            challenge is to identify who they are, structure useful company
            profiles, and help members connect directly through a system people
            actually want to use.
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
          <li>Create a profile-rich database of chamber companies.</li>
          <li>Enable direct sign-up that bypasses current bottlenecks.</li>
          <li>Support easier member-to-member discovery and introductions.</li>
          <li>
            Design the experience so participation feels rewarding, not
            administrative.
          </li>
        </ul>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="What we're looking for" />
        <div className="space-y-4 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-80 sm:text-base">
          <p>
            <span className="font-semibold text-[#173f69]">Judgment.</span> Did
            you design a system that members can use without extra admin help?
          </p>
          <p>
            <span className="font-semibold text-[#173f69]">Depth.</span> Did you
            define meaningful company profile data and community grouping logic?
          </p>
          <p>
            <span className="font-semibold text-[#173f69]">Execution.</span> Did
            you propose a workable points economy and end-to-end interaction
            flow?
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="Submission requirements" />
        <div className="space-y-4 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-80 sm:text-base">
          <p>
            A workable product concept or prototype that includes signup,
            profile, discovery, and connection flows.
          </p>
          <p>
            A clear gamification model with earnable/spendable points and
            examples of member actions.
          </p>
          <p>
            Include this core loop: earn points by contributing (attending
            meetings/calls, sharing updates, answering inquiries), spend points
            for network value (e.g., introductions, database actions), and earn
            points back for positive participation.
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="Before you start" />
        <div className="space-y-4 bg-[rgba(250,243,220,0.84)] px-5 py-5 [font-family:var(--font-paraluman-body)] rounded-[0.33em] text-base leading-7 text-[#173957] opacity-80 sm:px-6 sm:py-6 sm:text-lg sm:leading-8">
          <p>
            Bottom line: make companies want to be in this network and do good.
          </p>
          <p>
            Your solution should feel alive as a community product, not only as
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
