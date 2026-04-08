"use client";

import { motion } from "framer-motion";

export function WhyJoinSection() {
  const reasons = [
    {
      number: "01",
      title: "Real Impact",
      description:
        "Your code reaches 20M+ passengers. Not theory—real production impact.",
      icon: "✈️",
    },
    {
      number: "02",
      title: "Own the Work",
      description:
        "Solve real problems, not busy work. You'll ship features to production.",
      icon: "🎯",
    },
    {
      number: "03",
      title: "Learn Fast",
      description:
        "Work alongside experienced engineers from day one. Mentorship built in.",
      icon: "⚡",
    },
    {
      number: "04",
      title: "Grow Your Skills",
      description:
        "Full-stack exposure. Work on frontend, backend, ops, and more.",
      icon: "📈",
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
            Why Join Cebu Pacific
          </p>
          <h2 className="[font-family:var(--font-cebu-company-heading)] text-3xl font-black tracking-[-0.03em] text-[#1f68a9] sm:text-4xl">
            Why students would want to be here
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-[1.6rem] border border-[#2574BB]/12 bg-white p-7 shadow-[0_20px_40px_-34px_rgba(37,116,187,0.4)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff7ff] text-xl">
                  {reason.icon}
                </div>
                <div className="text-sm font-black tracking-[0.18em] text-[#2574BB]">
                  {reason.number}
                </div>
              </div>
              <h3 className="[font-family:var(--font-cebu-company-heading)] text-xl font-black text-[#1f3a55]">
                {reason.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-[#35526b]">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
