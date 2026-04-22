"use client";

import { RefObject, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  EllipsisVertical,
  X,
  Building,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Job } from "@/lib/db/db.types";
import { useProfileData } from "@/lib/api/student.data.api";
import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { JobDetailsSummary, SuperChallengeDetails } from "../shared/jobs";
import { SaveJobButton } from "../features/student/job/save-job-button";
import { ApplyToJobButton } from "../features/student/job/apply-to-job-button";
import { ShareJobButton } from "../features/student/job/share-job-button";
import { MissingNotice } from "../shared/jobs";

export const JobModal = ({
  job,
  openAppModal,
  applySuccessModalRef,
  ref,
  user,
}: {
  job: Job;
  openAppModal: () => void;
  ref?: RefObject<ModalHandle | null>;
  applySuccessModalRef?: RefObject<ModalHandle | null>;
  user?: {
    github_link?: string | null;
    portfolio_link?: string | null;
  };
}) => {
  const profile = useProfileData();
  const [isActionsSheetOpen, setIsActionsSheetOpen] = useState(false);

  const isSuperListing = Boolean(job?.challenge);
  const hasGithub = !!user?.github_link?.trim();
  const hasPortfolio = !!user?.portfolio_link?.trim();
  const needsCover = !!job?.internship_preferences?.require_cover_letter;
  const needsGithub = !!job?.internship_preferences?.require_github;
  const needsPortfolio = !!job?.internship_preferences?.require_portfolio;
  const missingRequired =
    (!!job?.internship_preferences?.require_github && !hasGithub) ||
    (!!job?.internship_preferences?.require_portfolio && !hasPortfolio);

  return (
    <ModalComponent ref={ref}>
      <div className="relative flex h-[100svh] max-h-[100svh] max-w-[100svw] flex-col bg-white">
        {/* Top bar with back + actions */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b px-4 pb-2 pt-5">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => ref?.current?.close()}
              className="h-8 w-8 p-0 -ml-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              aria-label="More actions"
              onClick={() => setIsActionsSheetOpen(true)}
            >
              <EllipsisVertical className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Scrollable content — mirrors desktop layout */}
        <div className="flex-1 overflow-y-auto overscroll-contain max-w-[100svw] ">
          {job && (
            <>
              <MissingNotice
                show={missingRequired}
                needsGithub={needsGithub && !hasGithub}
                needsPortfolio={needsPortfolio && !hasPortfolio}
              />
              <div className="px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+96px)] space-y-5">
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
                {isSuperListing && <SuperChallengeDetails job={job} mobile />}

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
            </>
          )}
        </div>

        {/* Bottom action bar — fixed within modal*/}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="flex gap-3">
            <SaveJobButton job={job} />
            <ApplyToJobButton
              profile={profile.data}
              job={job}
              openAppModal={openAppModal}
              className="w-full"
            />
          </div>
        </div>

        {isActionsSheetOpen && (
          <div className="absolute inset-0 z-40">
            <button
              type="button"
              aria-label="Close actions"
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsActionsSheetOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl border-t bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Job actions
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  aria-label="Close actions"
                  onClick={() => setIsActionsSheetOpen(false)}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              {job.id && (
                <ShareJobButton
                  id={job.id}
                  className="w-full justify-start"
                  onCopied={() => setIsActionsSheetOpen(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </ModalComponent>
  );
};

function HeaderCompact({ job }: { job: Job }) {
  const isSuperListing = Boolean(job.challenge);
  return (
    <div className="mb-1">
      <h1
        className={cn(
          "text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight max-w-full break-words hyphens-auto line-clamp-2 sm:line-clamp-none",
          isSuperListing && "font-bold tracking-tight",
        )}
      >
        {job.title}
      </h1>
      <div className="flex items-center gap-2 text-gray-600">
        <span className="truncate">{job.employer?.name}</span>
      </div>
      {job.location && (
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{job.location}</span>
        </div>
      )}
    </div>
  );
}

function ReqPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[0.33em] px-2 py-0.5 text-sm border",
        ok
          ? "bg-supporitve/10 border-supportive/50 text-supprotive"
          : "bg-warning/10 border-warning/50 text-warning",
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
