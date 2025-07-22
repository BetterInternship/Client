"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { motionVariants } from "@/lib/landingStudentLib/animations";
import CardSwap, {
  Card,
} from "@/components/landingStudent/sections/2ndSection/CardSwap/CardSwap";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

function useResponsiveCardSwap() {
  const [cardProps, setCardProps] = useState({
    cardDistance: 80,
    verticalDistance: 80,
    width: 450,
    height: 500,
    skew: 2,
  });

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        // Mobile
        setCardProps({
          cardDistance: 25,
          verticalDistance: 25,
          width: 360,
          height: 540,
          skew: 2,
        });
      } else if (window.innerWidth < 1024) {
        // Tablet
        setCardProps({
          cardDistance: 30,
          verticalDistance: 30,
          width: 380,
          height: 540,
          skew: 2,
        });
      } else {
        // Desktop
        setCardProps({
          cardDistance: 60,
          verticalDistance: 60,
          width: 400,
          height: 500,
          skew: 2,
        });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cardProps;
}

export function SoftwareSection() {
  const { cardDistance, verticalDistance, width, height, skew } =
    useResponsiveCardSwap();

  return (
    <section className="bg-neutral-950">
      <div className="max-w-7xl text-white sm:px-6 lg:px-8 mt-[-5em] sm:mt-0">
        {/* Main Layout with Header Left and Cards Center-Right */}
        <motion.div
          {...motionVariants.fadeInUp}
          transition={{ ...motionVariants.fadeInUp.transition, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center"
        >
          {/* Right Side - CardSwap */}
          <div className="flex-1 flex relative pl-12 justify-center">
            <div className="relative pt-24 sm:pt-32 lg:pt-96">
              <CardSwap
                width={width}
                height={height}
                cardDistance={cardDistance}
                verticalDistance={verticalDistance}
                delay={3500}
                pauseOnHover={false}
                skewAmount={skew}
                easing="elastic"
              >
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white-700/50 p-8 hover:cursor-pointer">
                  <Link href="/search/4952d62a-2d2c-456c-8fab-38e75ece9019">
                    <div className="text-white h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex flex-row items-center gap-2 bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          DLSU MOA
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">
                        ManuLife
                      </h4>
                      <p className="text-slate-200 mb-4 text-lg">
                        Associate Full Stack Engineer
                      </p>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-zinc-300">
                          <span className="mr-3">⏰</span>
                          <span>Full-Time Workload</span>
                        </div>
                        <div className="flex items-center text-zinc-300">
                          <span className="mr-3">📍</span>
                          <span>Hybrid Work Setup</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-white text-slate-800 hover:bg-slate-100 font-semibold py-3">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-white-700/50 p-8 hover:cursor-pointer">
                  <Link href="/search/b14487ea-8444-49b1-adfa-25c0a361befa">
                    <div className="text-white h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="bg-zinc-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <span className="flex flex-row items-center gap-2 bg-zinc-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            DLSU MOA
                          </span>
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">
                        Sun Life Philippines
                      </h4>
                      <p className="text-zinc-200 mb-4 text-lg">
                        Marketing Assistant
                      </p>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-neutral-300">
                          <span className="mr-3">💰</span>
                          <span>₱10,000/month</span>
                        </div>
                        <div className="flex items-center text-zinc-300">
                          <span className="mr-3">⏰</span>
                          <span>Full-Time Workload</span>
                        </div>
                        <div className="flex items-center text-zinc-300">
                          <span className="mr-3">📍</span>
                          <span>Hybrid Work Setup (BGC)</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-white text-zinc-800 hover:bg-zinc-100 font-semibold py-3">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700/50 p-8 hover:cursor-pointer">
                  <Link href="/search/770562a8-3a38-4bcb-a72f-bf5ae703833c">
                    <div className="text-white h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex flex-row items-center gap-2 bg-neutral-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          DLSU MOA
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">
                        Oracle
                      </h4>
                      <p className="text-neutral-200 mb-4 text-lg">
                        Software Developer Intern
                      </p>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-neutral-300">
                          <span className="mr-3">💰</span>
                          <span>₱14,000/month</span>
                        </div>
                        <div className="flex items-center text-zinc-300">
                          <span className="mr-3">⏰</span>
                          <span>Full-Time Workload</span>
                        </div>
                        <div className="flex items-center text-zinc-300">
                          <span className="mr-3">📍</span>
                          <span>Face to Face Setup</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-white text-neutral-800 hover:bg-neutral-100 font-semibold py-3">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                <Card className="bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700/50 p-8 hover:cursor-pointer">
                  <Link href="/search/770562a8-3a38-4bcb-a72f-bf5ae703833c">
                    <div className="text-white h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex flex-row items-center gap-2 bg-stone-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          DLSU MOA
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">
                        Alaska Milk Corporation
                      </h4>
                      <p className="text-stone-200 mb-4 text-lg">
                        Internship - Marketing
                      </p>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-stone-300">
                          <span className="mr-3">💰</span>
                          <span>₱720/day</span>
                        </div>
                        <div className="flex items-center text-zinc-300">
                          <span className="mr-3">⏰</span>
                          <span>Hybrid Work Setup</span>
                        </div>
                        <div className="flex items-center text-zinc-300">
                          <span className="mr-3">📍</span>
                          <span>Full-Time Workload</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-white text-stone-800 hover:bg-stone-100 font-semibold py-3">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800/50 p-8 hover:cursor-pointer">
                  <Link href="/search/7828346a-b1c5-4f03-8e15-459d31fb4d9f">
                    <div className="text-white h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex flex-row items-center gap-2 bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          DLSU MOA
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">
                        Jollibee
                      </h4>
                      <p className="text-gray-200 mb-4 text-lg">
                        Marketing Internship
                      </p>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-gray-300">
                          <span className="mr-3">💰</span>
                          <span>₱2,600/week</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <span className="mr-3">📍</span>
                          <span>Hybrid Setup</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <span className="mr-3">⏰</span>
                          <span>Full-Time Workload</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-white text-gray-800 hover:bg-gray-100 font-semibold py-3">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-black border-slate-800/50 p-8 hover:cursor-pointer">
                  <Link href="/search/56ca46aa-0b6f-485b-ac0e-92fcac316d54">
                    <div className="text-white h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex flex-row items-center gap-2 bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          DLSU MOA
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">
                        Asian Institute of Management
                      </h4>
                      <p className="text-slate-200 mb-4 text-lg">HR Intern</p>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-slate-300">
                          <span className="mr-3">📍</span>
                          <span>Face to Face Setup (Makati)</span>
                        </div>
                        <div className="flex items-center text-slate-300">
                          <span className="mr-3">⏰</span>
                          <span>Full-Time Workload</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-white text-slate-800 hover:bg-slate-100 font-semibold py-3">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-black border-slate-800/50 p-8 hover:cursor-pointer">
                  <Link href="/search/1223f377-22cc-43e8-b132-a635d879a374">
                    <div className="text-white h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex flex-row items-center gap-2 bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          DLSU MOA
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">
                        Giftaway
                      </h4>
                      <p className="text-slate-200 mb-4 text-lg">
                        Software Engineer Intern
                      </p>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-gray-300">
                          <span className="mr-3">💰</span>
                          <span>₱400/day</span>
                        </div>
                        <div className="flex items-center text-slate-300">
                          <span className="mr-3">📍</span>
                          <span>Hybrid Work Setup</span>
                        </div>
                        <div className="flex items-center text-slate-300">
                          <span className="mr-3">⏰</span>
                          <span>Full-Time Workload</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-white text-slate-800 hover:bg-slate-100 font-semibold py-3">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-black border-slate-800/50 p-8 hover:cursor-pointer">
                  <Link href="/search/c18ace50-030e-42e5-902f-e351e214b61b">
                    <div className="text-white h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <span className="flex flex-row items-center gap-2 bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          DLSU MOA
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white">
                        Megaworld
                      </h4>
                      <p className="text-slate-200 mb-4 text-lg">
                        Sales interns
                      </p>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-gray-300">
                          <span className="mr-3">💰</span>
                          <span>₱100/day</span>
                        </div>
                        <div className="flex items-center text-slate-300">
                          <span className="mr-3">📍</span>
                          <span>Face to Face Setup</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-white text-slate-800 hover:bg-slate-100 font-semibold py-3">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>
              </CardSwap>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
