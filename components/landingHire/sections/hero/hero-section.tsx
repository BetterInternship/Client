"use client";

import { motion, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Briefcase, LogIn, Calendar } from "lucide-react";
import Link from "next/link";
import { useAppContext } from "@/lib/ctx-app";
import { TextRotate } from "@/components/landingHire/sections/hero/text-rotate";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-black overflow-hidden">
      {/* Use image for both mobile and desktop */}
      <div className="absolute inset-0 w-full h-full overflow-y-hidden">
        <img
          src="/landingPage/mobileBG.png"
          alt="Landing"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-7xl px-4 w-full h-full flex items-center justify-center">
        <div className="max-w-fit w-fit flex flex-col items-start">
          {/* Animated headline from Preview */}
          <LayoutGroup>
            <motion.p
              className="flex flex-col whitespace-pre text-6xl break-all md:text-8xl font-bold text-white text-opacity-90 tracking-tighter mb-6 text-left leading-tight"
              layout
            >
              <motion.span
                className="pt-0.5 sm:pt-1 md:pt-2"
                layout
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                Interns.
              </motion.span>
              <TextRotate
                texts={["Faster.", "Better.", "Easier."]}
                mainClassName="text-white border-b-2 border-white/60 overflow-hidden w-fit justify-start mt-2"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </motion.p>
          </LayoutGroup>
          {/* Subtitle and buttons remain unchanged */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl sm:text-3xl font-medium text-white text-left text-opacity-80 mb-4"
          >
            We handle matching, scheduling, and paperwork <br />— so you don't
            have to.
          </motion.h2>
          <div className="flex flex-row justify-start pt-4 w-full items-start align-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-6 items-start"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="hover:bg-blue-600 text-white py-4 text-lg tracking-tight"
                >
                  Register
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gray-100 hover:bg-gray-300 text-gray-800 py-4 text-lg tracking-tight"
                >
                  Log In
                </Button>
              </Link>
            </motion.div>
          </div>
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
