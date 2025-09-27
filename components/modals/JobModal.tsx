"use client";

import { RefObject } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Building,
  Heart,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { Job } from "@/lib/db/db.types";
import { useAuthContext } from "@/lib/ctx-auth";
import { useApplications, useSavedJobs } from "@/lib/api/student.api";
import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { JobDetailsSummary } from "../shared/jobs";

export const JobModal = ({
  job,
  handleApply,
  ref,
  user,
}: {
  job: Job | null;
  handleApply: () => void;
  ref?: RefObject<ModalHandle | null>;
  user?: {
    github_link?: string | null;
    portfolio_link?: string | null;
  };
}) => {
  const savedJobs = useSavedJobs();
  const applications = useApplications();
  const auth = useAuthContext();

  const handleSave = async (job: Job) => {
    if (!auth.isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    await savedJobs.toggle(job.id ?? "");
  };

  // Requirement checks (align with desktop)
  const hasGithub = !!user?.github_link?.trim();
  const hasPortfolio = !!user?.portfolio_link?.trim();
  const needsCover = !!job?.require_cover_letter;
  const needsGithub = !!job?.require_github;
  const needsPortfolio = !!job?.require_portfolio;
  const missingRequired =
    (!!job?.require_github && !hasGithub) ||
    (!!job?.require_portfolio && !hasPortfolio);

  return (
    <ModalComponent ref={ref}>
      {/* Full dynamic viewport height + relative for bottom bar anchoring */}
      <div className="relative flex h-[100svh] max-h-[100svh] w-full flex-col bg-white">
        {/* Top bar (close only) — sticky and safe-area aware */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b px-4 pb-2 pt-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => ref?.current?.close()}
            className="h-8 w-8 p-0 -ml-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Scrollable content — mirrors desktop layout */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {job && (
            <div className="px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+96px)] space-y-5">
              <MissingNotice
                show={missingRequired}
                needsGithub={needsGithub && !hasGithub}
                needsPortfolio={needsPortfolio && !hasPortfolio}
              />
              
              {/* Header (compact; no actions on mobile) */}
              <HeaderCompact job={job} />

              {/* Requirement chips + notice (like desktop) */}
              <div className="flex flex-wrap gap-1.5">
                {needsCover && <ReqPill ok label="Cover letter required" />}
                {needsGithub && (
                  <ReqPill ok={hasGithub} label="GitHub linked" />
                )}
                {needsPortfolio && (
                  <ReqPill ok={hasPortfolio} label="Portfolio linked" />
                )}
              </div>

              {/* Job Details (grid) */}
              <Section title="Job Details">
                <JobDetailsSummary job={job} />
              </Section>

              <Divider />

              {/* Role overview */}
              <Section title="Role overview">
                <MarkdownBlock text={job.description} />
              </Section>

              {(job.requirements ||
                needsCover ||
                needsGithub ||
                needsPortfolio) && <Divider />}

              {/* Requirements */}
              {(job.requirements ||
                needsCover ||
                needsGithub ||
                needsPortfolio) && (
                <Section title="Requirements">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {needsCover && <ReqPill ok label="Cover letter" />}
                      {needsGithub && (
                        <ReqPill ok={hasGithub} label="GitHub profile" />
                      )}
                      {needsPortfolio && (
                        <ReqPill ok={hasPortfolio} label="Portfolio link" />
                      )}
                    </div>
                    <MarkdownBlock text={job.requirements} />
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>

        {/* Bottom action bar — fixed within modal, safe-area aware (UNCHANGED) */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => job && handleSave(job)}
              scheme={
                savedJobs.isJobSaved(job?.id ?? "") ? "destructive" : "default"
              }
              className="h-14 w-14"
              aria-label={
                savedJobs.isJobSaved(job?.id ?? "") ? "Unsave" : "Save"
              }
            >
              <Heart
                className={cn(
                  "w-6 h-6",
                  savedJobs.isJobSaved(job?.id ?? "") ? "fill-current" : ""
                )}
              />
            </Button>
            <Button
              disabled={applications.appliedJob(job?.id ?? "")}
              onClick={handleApply}
              className={cn(
                "flex-1 h-14 transition-all duration-300",
                applications.appliedJob(job?.id ?? "")
                  ? "bg-supportive text-white"
                  : "bg-primary text-white"
              )}
            >
              {applications.appliedJob(job?.id ?? "") ? "Applied" : "Apply Now"}
            </Button>
          </div>
        </div>
      </div>
    </ModalComponent>
  );
};

function HeaderCompact({ job }: { job: Job }) {
  return (
    <div className="mb-1">
      <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
        {job.title}
      </h1>
      <div className="flex items-center gap-2 text-gray-600">
        <Building className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{job.employer?.name}</span>
      </div>
      {job.location && (
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{job.location}</span>
        </div>
      )}
      {/* <p className="text-[11px] text-gray-500 mt-1">
        Listed on {formatDate(job.created_at ?? "")}
      </p> */}
    </div>
  );
}

function ReqPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[0.33em] px-2 py-0.5 text-sm border",
        ok
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-amber-50 border-amber-200 text-amber-900"
      )}
    >
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5" />
      )}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function MissingNotice({
  show,
  needsGithub,
  needsPortfolio,
}: {
  show: boolean;
  needsGithub: boolean;
  needsPortfolio: boolean;
}) {
  if (!show) return null;
  return (
    <div className="flex items-start gap-2 rounded-[0.33em] border border-amber-200 bg-amber-50 px-3 py-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-700 shrink-0" />
      <p className="text-sm text-amber-900 leading-snug">
        This job requires{" "}
        {needsGithub && needsPortfolio ? (
          <b>GitHub and Portfolio</b>
        ) : needsGithub ? (
          <b>GitHub</b>
        ) : (
          <b>Portfolio</b>
        )}
        . Update your profile to apply.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
      {children}
    </section>
  );
}

function Divider() {
  return <hr className="border-gray-200" />;
}

function MarkdownBlock({ text }: { text?: string | null }) {
  if (!text)
    return <p className="text-[13px] text-gray-600">No details provided.</p>;
  return (
    <div className="prose prose-sm max-w-none text-gray-700 text-[13px] leading-relaxed">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
