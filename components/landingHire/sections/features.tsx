"use client";

import { useEffect, useRef, useState } from "react";
import { BellDot, MessageCircleHeart, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppContext } from "@/lib/ctx-app";

const features = [
  {
    title: "Mass Applicant Actions",
    desc: "Review, shortlist, or reject hundreds of candidates in a single click. No more tedious, one-by-one status updates.",
    Icon: Users,
  },
  {
    title: "Instant Notifications",
    desc: "Keep candidates warm and your team aligned with automated alerts for interviews, offers, and next steps.",
    Icon: BellDot,
  },
  {
    title: "University Pipelines",
    desc: "Tap directly into university and student networks without the hassle of manual university outreach.",
    Icon: MessageCircleHeart,
  },
];

function MobileFeaturesSection() {
  return (
    <div className="space-y-10">
      {features.map((f) => (
        <div key={f.title} className="space-y-4">
          <div>
            <f.Icon className="h-8 w-8" />
            <h3 className="text-xl font-semibold">{f.title}</h3>
            <p>{f.desc}</p>
          </div>
          <div className="aspect-video rounded-[0.33em] bg-black" />
        </div>
      ))}
    </div>
  );
}

function DesktopFeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.index);
          setActiveIndex(i);
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-45% 0px -45% 0px",
      },
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid w-full max-w-7xl grid-cols-2 gap-10">
      <div className="sticky top-[calc(50vh-120px)] self-start space-y-8">
        {features.map((f, i) => (
          <div className="space-x-1">
            <div className="h-full w-1 bg-primary"> </div>
            <div className="space-y-1" key={f.title}>
              <AnimatePresence mode="wait">
                {activeIndex === i && (
                  <motion.div
                    key={`desc-${i}`}
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <f.Icon className="h-8 w-8" />
                  </motion.div>
                )}
              </AnimatePresence>
              <h3 className="text-xl tracking-tighter font-semibold">
                {f.title}
              </h3>
              <AnimatePresence mode="wait">
                {activeIndex === i && (
                  <motion.p
                    key={`desc-${i}`}
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    {f.desc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-16">
        {features.map((_, i) => (
          <div
            key={i}
            data-index={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="bg-black aspect-[16/10] rounded-[0.33em]"
          ></div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const { isMobile } = useAppContext();

  return (
    <section className="relative h-fit flex flex-col justify-center items-center gap-16 p-8">
      <div className=" max-w-7xl flex flex-col justify-center items-center">
        <p className="text-sm font-medium text-primary">
          Why teams choose BetterInternship
        </p>
        <h2 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight">
          Hiring workflows, simplified
        </h2>
      </div>
      {isMobile ? <MobileFeaturesSection /> : <DesktopFeaturesSection />}
    </section>
  );
}
