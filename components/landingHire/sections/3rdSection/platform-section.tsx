import Image from "next/image";
import React from "react";
import { Timeline } from "@/components/landingHire/sections/3rdSection/feature-section";
import { Card } from "@/components/ui/our-card";

export function TimelineDemo() {
  const data = [
    {
      title: "Instant Interviews",
      content: (
        <Card className="bg-transparent flex flex-col border-opacity-20">
          <p className="text-neutral-800 dark:text-neutral-200 text-lg md:text-lg font-normal">
            View student availability instantly on the platform. <br />
            Book interviews in seconds.
          </p>
          {/* <div className="grid grid-cols-2 gap-4">
            <Image
              src="/landingPage/instant-interviews.png"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-[0.33em] object-cover w-full"
            />
          </div> */}
        </Card>
      ),
    },
    {
      title: "Instant Messaging",
      content: (
        <Card className="bg-transparent flex flex-col border-opacity-20">
          <p className="text-neutral-800 dark:text-neutral-200 text-lg md:text-lg font-normal">
            Talk to applicants as soon as they apply. <br />
            Manage hundreds of conversations without flooding your inbox.
          </p>
          {/* <div className="grid grid-cols-2 gap-4">
            <Image
              src="/landingPage/instant-messaging.png"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-[0.33em] object-cover w-full"
            />
          </div> */}
        </Card>
      ),
    },
    {
      title: "Instant Paperwork",
      content: (
        <Card className="bg-transparent flex flex-col border-opacity-20">
          <p className="text-neutral-800 dark:text-neutral-200 text-lg md:text-lg font-normal">
            Let us handle the paperwork for you. <br />
            No spreadsheets needed.
          </p>
          {/* <div className="grid grid-cols-2 gap-4">
            <Image
              src="/landingPage/instant-paperwork.png"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-[0.33em] object-cover w-full"
            />
          </div> */}
        </Card>
      ),
    },
  ];
  return (
    <div className="min-h-screen w-full">
      <Timeline data={data} />
    </div>
  );
}
