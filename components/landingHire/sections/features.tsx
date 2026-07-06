"use client";

import { BellDot, MessageCircleHeart, Users } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="relative h-fit flex justify-center items-center overflow-hidden p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl">
        <div className="md:col-span-3">
          <p className="text-sm font-medium text-primary">
            Why teams choose BetterInternship
          </p>
          <h2 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight">
            Hiring workflows, simplified
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for fast screening, clear communication, and smoother campus
            pipelines.
          </p>
        </div>
        <div className="group rounded-[0.33em] border border-indigo-900/10 bg-indigo-100/20 text-indigo-900 backdrop-blur p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-indigo-900/40">
          <Users className="h-8 w-8" />
          <h3 className="text-xl tracking-tighter font-semibold text-indigo-900">
            Mass Applicant Actions
          </h3>
          <p className="text-indigo-900">
            Review, shortlist, or reject hundreds of candidates in a single
            click. No more tedious, one-by-one status updates.
          </p>
        </div>

        <div className="group rounded-[0.33em] border border-emerald-900/10 bg-emerald-100/20 text-emerald-900 backdrop-blur p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-emerald-900/40">
          <BellDot className="h-8 w-8" />
          <h3 className="text-xl tracking-tighter font-semibold text-emerald-900">
            Instant Notifications
          </h3>
          <p className="text-emerald-900">
            Keep candidates warm and your team aligned with automated alerts for
            interviews, offers, and next steps.
          </p>
        </div>

        <div className="group rounded-[0.33em] border border-violet-900/10 bg-violet-100/20 text-violet-900 backdrop-blur p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-violet-900/40">
          <MessageCircleHeart className="h-8 w-8" />
          <h3 className="text-xl tracking-tighter font-semibold text-violet-900">
            University Pipelines
          </h3>
          <p className="text-violet-900">
            Tap directly into university and student networks without the hassle
            of manual university outreach.
          </p>
        </div>
      </div>
    </section>
  );
}
