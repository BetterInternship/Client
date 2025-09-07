"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  Search,
  Building2,
  Wallet,
  Laptop2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

import { JOBS, type Job } from "./job-data";

/* ------------------------------ Tag pill ------------------------------ */
export function Tag({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "blue";
}) {
  const toneMap =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${toneMap}`}
    >
      {children}
    </span>
  );
}

/* ------------------------- Left: search + list ------------------------- */
export function JobList({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="p-4 sm:p-6">
      {/* search bar + MOA pill */}
      <div className="mb-4">
        <div className="rounded-md border border-slate-200 bg-white p-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search Job Listings"
                placeholder="Search Job Listings"
                className="h-10 w-full rounded-md border-0 bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Tag tone="green">MOA only</Tag>
            </div>
          </div>
        </div>
      </div>

      {/* job cards */}
      <div className="space-y-3">
        {JOBS.map((job) => {
          const selected = job.id === selectedId;
          return (
            <button
              type="button"
              key={job.id}
              onClick={() => onSelect(job.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(job.id);
                }
              }}
              aria-pressed={selected}
              className={`
                w-full text-left rounded-md border bg-white p-4 shadow-sm outline-offset-2
                ${
                  selected
                    ? "border-blue-300 ring-1 ring-blue-200"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500
              `}
            >
              <div className="text-[13px] text-slate-600 break-words">
                {job.company}
              </div>
              <h4 className="mt-0.5 line-clamp-2 text-base font-semibold text-slate-900">
                {job.title}
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.tags.map((t, i) => (
                  <Tag key={i} tone={t === "DLSU MOA" ? "green" : "slate"}>
                    {t}
                  </Tag>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/* --------------------------- Right: details --------------------------- */

export function DetailsPane({ job }: { job: Job }) {
  const salary = job.pay ?? "None";
  const workMode = job.location ?? "—";
  const workload = job.workload ?? "—";

  return (
    <main className="p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {job.title}
          </h1>
          <div className="mt-1 text-sm text-slate-600">{job.company}</div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            asChild
            className="h-9 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <a href={job.href}>Apply</a>
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-md border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Save
          </Button>
        </div>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Job Details</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Laptop2 className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-slate-500">Work Mode</div>
              <div>{workMode}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-slate-500">Salary</div>
              <div>{salary}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-slate-500">Work Load</div>
              <div>{workload}</div>
            </div>
          </div>
        </div>

        <hr className="my-4 border-slate-200" />

        <h3 className="text-sm font-semibold text-slate-800">Description</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Will assist and learn from the Brand Strategist in strategic branding
          projects utilizing AI Agents.
        </p>

        <hr className="my-4 border-slate-200" />

        <h3 className="text-sm font-semibold text-slate-800">Requirements</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <Tag tone="blue">Resume</Tag>
          <Tag>Github Profile</Tag>
          <Tag>Portfolio</Tag>
          <Tag tone="blue">Cover Letter</Tag>
          {job.badge && <Tag tone="green">{job.badge}</Tag>}
        </div>
      </section>
    </main>
  );
}

/* ----------------------------- Side copy ----------------------------- */

export function SideCopy() {
  return (
    <div className="flex flex-col items-start justify-center gap-4">
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        One-click apply
      </span>
      <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Apply fast, <br className="hidden sm:block" />
        Get hired 
        <AnimatedShinyText>faster.</AnimatedShinyText>
      </h2>
      <ul className="mt-2 space-y-2 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-500" /> Autofill paperwork
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-500" /> MOA-ready docs
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-500" /> One profile, many
          applications
        </li>
      </ul>
    </div>
  );
}

/* ---------------------- Page content + grid spans ---------------------- */

export function SearchPreview() {
  const [selectedId, setSelectedId] = useState<string>(JOBS[0].id);
  const selectedJob = useMemo(
    () => JOBS.find((j) => j.id === selectedId)!,
    [selectedId]
  );

  return (
    <div className="grid grid-cols-1 lg:h-full lg:grid-cols-12">
      {/* Mobile search bar */}
      <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-3">
        <div className="rounded-md border border-slate-200 bg-white p-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search Job Listings"
                placeholder="Search Job Listings"
                className="h-10 w-full rounded-md border-0 bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <Tag tone="green">MOA only</Tag>
          </div>
        </div>
      </div>

      {/* Left column (desktop) — the ONLY scroller */}
      <div className="hidden min-w-0 border-r border-slate-200 lg:col-span-4 lg:block lg:h-full lg:overflow-y-auto">
        <JobList selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Right column (fixed within the shell height) */}
      <div className="min-w-0 lg:col-span-8 lg:h-full lg:overflow-hidden">
        <DetailsPane job={selectedJob} />
      </div>

      {/* Mobile list below details */}
      <div className="border-t border-slate-200 lg:hidden">
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            {JOBS.map((job) => {
              const selected = job.id === selectedId;
              return (
                <button
                  type="button"
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  className={`w-full text-left rounded-md border bg-white p-4 shadow-sm ${
                    selected
                      ? "border-blue-300 ring-1 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-[13px] text-slate-600">
                    {job.company}
                  </div>
                  <h4 className="mt-0.5 text-base font-semibold text-slate-900">
                    {job.title}
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.tags.map((t, i) => (
                      <Tag key={i} tone={t === "DLSU MOA" ? "green" : "slate"}>
                        {t}
                      </Tag>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}