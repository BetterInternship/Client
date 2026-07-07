"use client";

import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { BellDot, LucideIcon, MessageCircleHeart, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppContext } from "@/lib/ctx-app";
import { LandingFeatureMassApply } from "./features/mass-applicant-actions";
import { LandingFeatureNotifications } from "./features/notifications";
import { LandingFeaturePipeline } from "./features/pipeline";
import { cn } from "@/lib/utils/string-utils";
import MagneticButton from "@/components/ui/magnetic-button";

type Feature = {
  title: string;
  desc: string;
  Icon: LucideIcon;
  Visual: ReactNode;
};

const features: Feature[] = [
  {
    title: "Mass Applicant Actions",
    desc: "Review, shortlist, or reject hundreds of candidates in a single click. No more tedious, one-by-one status updates.",
    Icon: Users,
    Visual: <LandingFeatureMassApply />,
  },
  {
    title: "Relevant Notifications",
    desc: "Keep candidates warm and your team aligned with automated alerts for interviews, offers, and next steps without being overwhelmed by spam.",
    Icon: BellDot,
    Visual: <LandingFeatureNotifications />,
  },
  {
    title: "University Pipelines",
    desc: "Tap directly into university and student networks without the hassle of manual university outreach.",
    Icon: MessageCircleHeart,
    Visual: <LandingFeaturePipeline />,
  },
];

function MobileFeaturesSection({
  cardRefs,
}: {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <div className="space-y-10">
      {features.map((f, i) => (
        <div key={f.title} className="space-y-4">
          <div>
            <f.Icon className="h-8 w-8" />
            <h3 className="text-xl font-semibold">{f.title}</h3>
            <p>{f.desc}</p>
          </div>
          <div
            key={i}
            data-index={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="aspect-[16/10] rounded-[0.33em] overflow-hidden"
          >
            {f.Visual}
          </div>
        </div>
      ))}
    </div>
  );
}

function DesktopFeaturesSection({
  cardRefs,
}: {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

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
              <h3
                className={cn(
                  "text-3xl tracking-tighter font-semibold transition-colors",
                  activeIndex === i ? "" : "text-gray-400",
                )}
              >
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
        {features.map((f, i) => (
          <div
            key={i}
            data-index={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="aspect-[16/10] rounded-[0.33em] overflow-hidden shadow-2xl shadow-black/10"
          >
            {f.Visual}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const { isMobile } = useAppContext();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section className="relative h-fit flex flex-col justify-center items-center gap-16 p-8">
      <div className="max-w-7xl">
        <p className="text-sm font-medium text-primary">
          Why teams choose BetterInternship
        </p>
        <h2 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight">
          Hiring workflows, simplified
        </h2>
      </div>
      {isMobile ? (
        <MobileFeaturesSection cardRefs={cardRefs} />
      ) : (
        <DesktopFeaturesSection cardRefs={cardRefs} />
      )}
    </section>
  );
}
