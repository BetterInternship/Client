"use client";

import { motion } from "framer-motion";

export function ImpactSection() {
  const stats = [
    {
      number: "20M+",
      label: "Annual Passengers",
      sublabel: "Your code reaches them daily",
      icon: "✈️",
    },
    {
      number: "80+",
      label: "Destinations",
      sublabel: "Across Southeast Asia",
      icon: "🌏",
    },
    {
      number: "24/7",
      label: "Platform Uptime",
      sublabel: "Serving travelers around the clock",
      icon: "⚡",
    },
  ];

  return (
    <section className="relative bg-white px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#2574BB]/70">
            Real Impact
          </p>
          <h2 className="[font-family:var(--font-cebu-company-heading)] text-3xl font-black tracking-[-0.03em] text-[#1f68a9] sm:text-4xl">
            What scale looks like at Cebu Pacific
          </h2>
        </motion.div>

        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-[1.6rem] border border-[#2574BB]/12 bg-[#fffdf7] p-8 text-center shadow-[0_20px_40px_-34px_rgba(243,217,138,0.7)]"
            >
              <div className="mb-4 text-4xl">{stat.icon}</div>
              <div className="[font-family:var(--font-cebu-company-heading)] text-4xl font-black text-[#1f3a55] sm:text-5xl">
                {stat.number}
              </div>
              <h3 className="mt-3 [font-family:var(--font-cebu-company-heading)] text-lg font-black text-[#1f3a55]">
                {stat.label}
              </h3>
              <p className="mt-2 text-sm text-[#35526b]">{stat.sublabel}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-lg leading-8 text-[#35526b] sm:text-xl">
            At Cebu Pacific, you're not building in a vacuum. You're{" "}
            <span className="font-black text-[#1f3a55]">
              shipping code that directly impacts millions of travelers every
              day
            </span>
            . Every pull request gets deployed. Every feature gets used. That's
            the difference between learning and making a real impact.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
