"use client";

import { motion, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAppContext } from "@/lib/ctx-app";
import { TextRotate } from "@/components/landingStudent/sections/hero/text-rotate";

export function HeroSection() {
  const videos = [
    "/landingPage/smile.mov",
    "/landingPage/coding.mov",
    "/landingPage/friends.mov",
    "/landingPage/coding2.mov",
    "/landingPage/nod.mov",
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { isMobile } = useAppContext();

  useEffect(() => {
    if (isMobile) return;
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isMobile, videos.length]);

  return (
    <section className="relative min-h-screen flex items-center bg-black overflow-hidden">
      {/* Show image on mobile, video on tablet/desktop */}
      <div className="absolute inset-0 w-full h-full overflow-y-hidden">
        {isMobile ? (
          <img
            src="/landingPage/mobileBG.jpg"
            alt="Landing"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <video
            key={currentVideoIndex}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={videos[currentVideoIndex]}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center justify-center">
        <div className="max-w-5xl w-full flex flex-col items-left justify-center">
          <LayoutGroup>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col text-5xl sm:text-8xl font-bold text-white text-opacity-90 tracking-tighter mb-6 leading-tight"
              layout
            >
              <motion.span
                className="pt-0.5 sm:pt-1 md:pt-2"
                layout
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                No More&nbsp;
                <TextRotate
                  texts={[
                    "Waiting.",
                    "Ghosting.",
                    "Stress.",
                  ]}
                  mainClassName="text-white border-b-2 border-white/60 overflow-hidden w-fit justify-start"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </motion.span>
            </motion.h1>
          </LayoutGroup>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl sm:text-3xl font-medium text-white text-left text-opacity-80 mb-4"
          >
            Skip the waitlist. Get matched, scheduled, and hired—fast.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 items-center pt-32 lg:py-16"
          >
            <Link href="/search">
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 text-lg rounded-[0.33em] tracking-tight"
              >
                Find Internships
              </Button>
            </Link>

            <Link href={process.env.NEXT_PUBLIC_CLIENT_HIRE_URL as string}>
              <Button
                variant="ghost"
                className="text-white hover:opacity-70 hover:bg-transparent transition-opacity text-lg font-medium flex items-center"
              >
                <ChevronRight />
                For Employers
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Subtle animated elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-full"
      >
        <div className="w-full h-full bg-gradient-to-l from-white/5 to-transparent" />
      </motion.div>
    </section>
  );
}
