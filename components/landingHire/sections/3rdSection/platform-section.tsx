import Image from "next/image";
import React from "react";
import { Timeline } from "@/components/landingHire/sections/3rdSection/feature-section";

export function TimelineDemo() {
  const data = [
    {
      title: "Instant Interviews",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xl md:text-3xl font-normal mb-6 max-w-[95vw]">
            View student availability instantly on the platform. Book interviews
            in seconds.
          </p>
          <div className="flex items-left">
            <Image
              src="/landingPage/3rdSec/1.png"
              alt="hero template"
              width={420}      // increased from 350
              height={260}     // increased from 200
              className="rounded-[0.33em] object-cover"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Instant Messaging",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xl md:text-3xl font-normal">
            Talk to applicants as soon as they apply.
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-xl md:text-3xl font-normal mb-10">
            Manage hundreds of conversations without flooding your inbox.
          </p>
          <div className="flex items-left">
            <Image
              src="/landingPage/3rdSec/2.png"
              alt="hero template"
              width={420}      // increased from 350
              height={260}     // increased from 200
              className="rounded-[0.33em] object-cover"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Instant Paperwork",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xl md:text-3xl font-normal mb-10">
            Let us handle the paperwork for you. No spreadsheets needed.
          </p>
          <div className="flex items-left">
            <Image
              src="/landingPage/3rdSec/3.png"
              alt="hero template"
              width={420}      // increased from 350
              height={260}     // increased from 200
              className="rounded-[0.33em] object-cover"
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="min-h-screen w-full">
      <Timeline data={data} />
    </div>
  );
}
