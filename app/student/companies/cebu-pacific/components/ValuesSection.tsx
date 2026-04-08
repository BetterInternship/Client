"use client";

import { motion } from "framer-motion";
import { Code2, Target, Zap, Trophy } from "lucide-react";

export function ValuesSection() {
  const values = [
    {
      icon: Code2,
      title: "Ship Code That Matters",
      description:
        "Real features in production. Real impact. Build things people actually use.",
    },
    {
      icon: Target,
      title: "Problem-Solving",
      description:
        "Tackle real problems. Your resume doesn't matter. Your thinking and execution do.",
    },
    {
      icon: Zap,
      title: "Move Fast",
      description:
        "Speed beats perfection. Iterate, learn, improve. Every week counts.",
    },
    {
      icon: Trophy,
      title: "Visible Impact",
      description:
        "See your work used by millions. Understand the real business value you create.",
    },
  ];

  return (
    <section className="relative bg-[#f8fbff] px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#2574BB]/70">
            Our Values
          </p>
          <h2 className="[font-family:var(--font-cebu-company-heading)] text-3xl font-black tracking-[-0.03em] text-[#1f68a9] sm:text-4xl">
            How the work should feel
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-[1.6rem] border border-[#2574BB]/12 bg-white p-8 shadow-[0_20px_40px_-34px_rgba(37,116,187,0.35)]"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2574BB] text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="[font-family:var(--font-cebu-company-heading)] text-xl font-black text-[#1f3a55]">
                  {value.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-[#35526b]">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
