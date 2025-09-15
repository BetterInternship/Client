"use client";

import { useEffect, useRef, useState } from "react";

/* --------------------------------------------------------- */
/* Single component: counters + two L→R marquee rows (slow)  */
/* --------------------------------------------------------- */

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
};

export default function TestimonialsMarquee() {
  const ROW_ONE: Testimonial[] = [
    {
      quote: "One click and done. I applied to 12 roles in 10 minutes.",
      name: "Ava Santos",
      role: "CS Undergrad",
      company: "DLSU",
    },
    {
      quote: "MOA-ready docs saved me hours. HR literally said ‘wow’.",
      name: "Miguel Cruz",
      role: "Marketing Intern",
      company: "Jollibee",
    },
    {
      quote: "Clean UI, fast process, zero forms. Finally.",
      name: "Kyra Lim",
      role: "Design Intern",
      company: "Oracle",
    },
    {
      quote: "Got an interview the same day I applied.",
      name: "Paolo Reyes",
      role: "Software Intern",
      company: "Giftaway",
    },
  ];

  const ROW_TWO: Testimonial[] = [
    {
      quote: "Autofill made my week. No more copy/paste portals.",
      name: "Zara Tan",
      role: "BSIT",
      company: "DLSU",
    },
    {
      quote: "One profile everywhere is a game changer.",
      name: "Lance V.",
      role: "Business Intern",
      company: "Sun Life",
    },
    {
      quote: "Modern UX that respects my time.",
      name: "Jas D.",
      role: "HR Intern",
      company: "AIM",
    },
    {
      quote: "I focused on work instead of paperwork.",
      name: "M. Hernandez",
      role: "Brand Intern",
      company: "Manulife",
    },
  ];

  /* ---------------------------- subcomponents ---------------------------- */

  function CounterStat({
    value,
    suffix = "",
    label,
    durationMs = 1400,
    decimals = 0,
    className = "",
  }: {
    value: number;
    suffix?: string;
    label?: string;
    durationMs?: number;
    decimals?: number;
    className?: string;
  }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - start) / durationMs, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setDisplay(eased * value);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        },
        { threshold: 0.3 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, [value, durationMs]);

    return (
      <div className={`w-full flex flex-col items-end ${className}`}>
        <span
          ref={ref}
          className="tabular-nums text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight"
        >
          {display.toFixed(decimals)}
          {suffix}
        </span>

        {label ? (
          <span className="mt-1 text-sm leading-5 text-slate-600 text-right text-balance min-h-[2.5rem]">
            {label}
          </span>
        ) : null}
      </div>
    );
  }

  function TestimonialCard({ t }: { t: Testimonial }) {
    return (
      <figure className="w-[280px] sm:w-[340px] lg:w-[380px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <blockquote className="text-sm sm:text-[15px] leading-6 text-slate-700">
          “{t.quote}”
        </blockquote>
        <figcaption className="mt-4 flex items-center gap-3">
          {t.avatar ? (
            <img
              src={t.avatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm">
              {t.name.charAt(0)}
            </div>
          )}
          <div className="text-sm">
            <div className="font-semibold text-slate-900">{t.name}</div>
            <div className="text-slate-500">
              {t.role}
              {t.company ? ` • ${t.company}` : ""}
            </div>
          </div>
        </figcaption>
      </figure>
    );
  }

  function MarqueeRow({
    items,
    seconds = 40, // slower baseline speed
    className = "",
  }: {
    items: Testimonial[];
    seconds?: number;
    className?: string;
  }) {
    // Longhand animation props so nothing restarts mid-flight.
    const trackStyle: React.CSSProperties = {
      animationName: "marquee-ltr",
      animationDuration: `${seconds}s`,
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      willChange: "transform",
    };

    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />

        <div
          className="marquee-track flex w-max gap-4 sm:gap-6 motion-reduce:[animation-play-state:paused]"
          style={trackStyle}
        >
          {/* copy A */}
          <div className="flex w-max items-stretch gap-4 sm:gap-6">
            {items.map((t, i) => (
              <TestimonialCard key={`a-${i}`} t={t} />
            ))}
          </div>
          {/* copy B */}
          <div className="flex w-max items-stretch gap-4 sm:gap-6 " aria-hidden>
            {items.map((t, i) => (
              <TestimonialCard key={`b-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ render ------------------------------ */

  return (
    <section className="w-full bg-gradient-to-b from-white to-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* header */}
        <div className="mb-8 sm:mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              What students are saying
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Loved by interns across the PH
            </h2>
          </div>

          {/* counters */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 items-end justify-items-end">
            <CounterStat
              className="text-right"
              value={800}
              suffix="+"
              label="Applications auto-filled"
            />
            <CounterStat
              className="text-right"
              value={100}
              suffix="+"
              label="Partner companies"
            />
            <CounterStat
              className="text-right"
              value={10}
              suffix="x"
              label="Faster apply"
            />
          </div>
        </div>

        {/* rows (left → right), slower */}
        <div className="space-y-6">
          <MarqueeRow items={ROW_ONE} seconds={42} className="py-3" />
          <MarqueeRow items={ROW_TWO} seconds={52} className="py-3" />
        </div>
      </div>

      {/* keyframes */}
      <style jsx global>{`
        /* seamless L→R loop: duplicate content, move from -50% to 0% */
        @keyframes marquee-ltr {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </section>
  );
}
