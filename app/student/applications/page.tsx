"use client";

// React imports
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookA, Eye } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Hooks (preserving existing implementations)
import { useApplicationsData } from "@/lib/api/student.data.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { useDbRefs } from "@/lib/db/use-refs";
import { formatTimeAgo } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";
import { JobHead, SuperListingBadge } from "@/components/shared/jobs";
import { UserApplication } from "@/lib/db/db.types";
import { HeaderText, HeaderIcon } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { PageError } from "@/components/ui/error";
import { cn } from "@/lib/utils";
import { useFile } from "@/hooks/use-file";
import { UserService } from "@/lib/api/services";
import { useModal } from "@/hooks/use-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";

export default function ApplicationsPage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const rawApplications = useApplicationsData();
  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: (resumeId: string) => UserService.getMyResumeURL(resumeId),
    route: (resumeId: string) => `/users/me/resume/${resumeId}`,
  });
  const { open: openResumeModal, Modal: ResumeModal } = useModal(
    "application-resume-modal",
  );

  const applications = React.useMemo(
    () => ({
      ...rawApplications,
      data: [...rawApplications.data].sort((a, b) => {
        const firstDate = a.applied_at ? new Date(a.applied_at).getTime() : 0;
        const secondDate = b.applied_at ? new Date(b.applied_at).getTime() : 0;
        return secondDate - firstDate;
      }),
    }),
    [rawApplications],
  );
  redirectIfNotLoggedIn();

  const openResumePreview = async (resumeId: string) => {
    await syncResumeURL(resumeId);
    openResumeModal();
  };

  return (
    <div className="h-full overflow-y-auto py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={BookA}></HeaderIcon>
            <HeaderText>My Applications</HeaderText>
          </div>
          <div className="flex-1 flex-row">
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              Track your internship applications and their status
            </p>
            <Badge>
              {applications.data.length}{" "}
              {applications.data.length === 1 ? "application" : "applications"}
            </Badge>
          </div>
        </div>
        <Separator className="mt-4 mb-8" />

        {applications.isPending ? (
          <Loader>Loading your applications...</Loader>
        ) : applications.error ? (
          <PageError
            title="Failed to load applications"
            description={applications.error.message}
          />
        ) : applications.data.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <Card className="max-w-md m-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Ready to start your internship journey? Browse our job listings
                and submit your first application.
              </p>
              <Link href="/search">
                <Button className="bg-primary hover:bg-primary/90">
                  Browse Jobs
                </Button>
              </Link>
            </Card>
          </div>
        ) : (
          <div className="space-y-3">
            {applications?.data.map((application) => (
              <ApplicationCard
                key={application.id ?? application.job_id}
                application={application}
                onPreviewResume={openResumePreview}
              />
            ))}
          </div>
        )}

        <ResumeModal className="max-w-[80vw]">
          <PDFPreview url={resumeURL} />
        </ResumeModal>
      </div>
    </div>
  );
}

const ApplicationCard = ({
  application,
  onPreviewResume,
}: {
  application: UserApplication;
  onPreviewResume: (resumeId: string) => void | Promise<void>;
}) => {
  const router = useRouter();
  const { to_app_status_name } = useDbRefs();
  const job = application.job ?? application.jobs;
  const jobRecord = job as Record<string, unknown> | undefined;
  const employer = application.employer ?? application.employers;
  const challengeTitleFromJoin = (
    jobRecord?.jobs_challenge as { title?: unknown } | undefined
  )?.title;
  const isSuperListing =
    typeof challengeTitleFromJoin === "string" &&
    challengeTitleFromJoin.trim().length > 0;
  const isUnavailable = !job?.is_active || job?.is_deleted;
  const canOpenListing = !!job?.id && !isUnavailable;
  const statusLabel = to_app_status_name(application.status) ?? "Pending";
  let statusBadgeType: "destructive" | "supportive" | "warning" = "warning";
  if (statusLabel === "Rejected") statusBadgeType = "destructive";
  else if (statusLabel === "Accepted" || statusLabel === "Hired")
    statusBadgeType = "supportive";
  else statusBadgeType = "warning";
  const resumeId = application.resume_id;
  const listingHref = `/search/${job?.id}`;
  const openListing = () => {
    if (canOpenListing) router.push(listingHref);
  };

  return (
    <Card
      role={canOpenListing ? "link" : undefined}
      tabIndex={canOpenListing ? 0 : undefined}
      onClick={openListing}
      onKeyDown={(event) => {
        if (!canOpenListing) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openListing();
        }
      }}
      className={cn(
        "rounded-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        canOpenListing &&
          !isSuperListing &&
          "cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary/20",
        canOpenListing &&
          isSuperListing &&
          "cursor-pointer hover:ring-1 hover:ring-primary/20",
        isSuperListing &&
          "super-card relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(254,240,138,0.5),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(251,146,60,0.18),transparent_35%),linear-gradient(150deg,rgba(255,251,235,1)_0%,rgba(255,255,255,1)_45%,rgba(254,243,199,0.98)_100%)]",
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge type={statusBadgeType}>{statusLabel}</Badge>
            <Badge type="accent">
              Applied {formatTimeAgo(application.applied_at ?? "")}
            </Badge>
            {isSuperListing && <SuperListingBadge compact className="w-fit" />}
          </div>
          {canOpenListing ? (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-[0.33em] bg-primary/5 text-primary/80">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          ) : (
            isUnavailable && (
              <Badge type="destructive">Job no longer available.</Badge>
            )
          )}
        </div>
        <JobHead title={job?.title} employer={employer?.name} />
        <div className="flex flex-col flex-wrap justify-between items-start gap-2 text-gray-600">
          <Button
            type="button"
            variant="outline"
            scheme="primary"
            disabled={!resumeId}
            aria-label={`Submitted resume`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (resumeId) void onPreviewResume(resumeId);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview Resume
          </Button>
        </div>
      </div>
    </Card>
  );
};
