"use client";

// React imports
import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  BookA,
  CheckCircle2,
  Eye,
  Heart,
} from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/new-tabs";

// Hooks (preserving existing implementations)
import {
  useApplicationsData,
  useJobsData,
  useWaitlistsData,
} from "@/lib/api/student.data.api";
import { useWaitlistActions } from "@/lib/api/student.actions.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { useDbRefs } from "@/lib/db/use-refs";
import { formatTimeAgo, cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";
import { JobHead, SuperListingBadge } from "@/components/shared/jobs";
import { JobWaitlist, UserApplication } from "@/lib/db/db.types";
import { HeaderTitle } from "@/components/ui/text";
import { PageError } from "@/components/ui/error";
import { useFile } from "@/hooks/use-file";
import { UserService } from "@/lib/api/services";
import { useModal } from "@/hooks/use-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import {
  SavedJobCard,
  SavedJobItem,
} from "@/components/features/student/job/saved-job-card";

type TabValue = "applications" | "saved" | "alerts";

const resolveTab = (raw: string | null): TabValue => {
  if (raw === "saved") return "saved";
  if (raw === "alerts") return "alerts";
  return "applications";
};

const TAB_META: Record<TabValue, { icon: typeof BookA; label: string }> = {
  applications: { icon: BookA, label: "My Applications" },
  saved: { icon: Heart, label: "My Saved Jobs" },
  alerts: { icon: Bell, label: "My Job Alerts" },
};

const tabTriggerClassName = cn(
  "flex-1 px-2 text-xs whitespace-nowrap",
  "sm:px-8 sm:text-sm",
);

export default function MyJobsPage() {
  return (
    <Suspense fallback={<Loader>Loading your jobs...</Loader>}>
      <MyJobsPageInner />
    </Suspense>
  );
}

function MyJobsPageInner() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  redirectIfNotLoggedIn();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));

  const rawApplications = useApplicationsData();
  const jobs = useJobsData();
  const waitlists = useWaitlistsData();

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

  const savedJobs = jobs.savedJobs as SavedJobItem[];

  const appliedJobIds = React.useMemo(
    () =>
      new Set(
        applications.data
          .map((a) => a.job_id)
          .filter((id): id is string => !!id),
      ),
    [applications.data],
  );

  const visibleNotified = React.useMemo(
    () =>
      waitlists.notified.filter((row) => {
        if (appliedJobIds.has(row.job_id)) return false;
        if (row.job.hibernating) return false;
        if (!row.job.is_active || row.job.is_deleted) return false;
        return true;
      }),
    [waitlists.notified, appliedJobIds],
  );

  const alertsCount = waitlists.alerts.length + visibleNotified.length;
  const hasItsBack = visibleNotified.length > 0;

  const openResumePreview = async (resumeId: string) => {
    await syncResumeURL(resumeId);
    openResumeModal();
  };

  const setTab = (next: string) => {
    const value = resolveTab(next);
    const query = value === "applications" ? "" : `?tab=${value}`;
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  return (
    <div className="h-full overflow-y-auto py-6 px-4 [scrollbar-gutter:stable]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <HeaderTitle icon={TAB_META[tab].icon}>
                {TAB_META[tab].label}
              </HeaderTitle>
            </motion.div>
          </AnimatePresence>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="sticky top-0 z-10 mb-8 flex w-full bg-white">
            <TabsTrigger value="applications" className={tabTriggerClassName}>
              Applications
              <span className="ml-1 max-[374px]:hidden text-muted-foreground">
                {`(${applications.data.length})`}
              </span>
            </TabsTrigger>
            <TabsTrigger value="saved" className={tabTriggerClassName}>
              Saved
              <span className="ml-1 max-[374px]:hidden text-muted-foreground">
                {`(${savedJobs.length})`}
              </span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className={tabTriggerClassName}>
              Alerts
              {alertsCount > 0 && (
                <span className="ml-1 max-[374px]:hidden text-muted-foreground">
                  {`(${alertsCount})`}
                </span>
              )}
              {hasItsBack && (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-supportive align-middle"
                />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
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
                    Ready to start your internship journey? Browse our job
                    listings and submit your first application.
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
                {applications.data.map((application) => (
                  <ApplicationCard
                    key={application.id ?? application.job_id}
                    application={application}
                    onPreviewResume={openResumePreview}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {jobs.isPending ? (
              <Loader>Loading saved jobs...</Loader>
            ) : jobs.error ? (
              <PageError
                title="Failed to load saved jobs."
                description={jobs.error.message}
              />
            ) : savedJobs.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <Card className="max-w-md m-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No saved jobs yet
                  </h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Save jobs by clicking the heart icon on job listings to
                    see them here.
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
                {savedJobs.map((savedJob, index) => (
                  <SavedJobCard
                    key={savedJob.id ?? savedJob.job_id ?? `saved-job-${index}`}
                    savedJob={savedJob}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts">
            {!waitlists.alerts.length && !visibleNotified.length ? (
              <div className="text-center py-16 animate-fade-in">
                <Card className="max-w-md m-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No job alerts
                  </h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Alerts come from listings that go on a temporary pause.
                    Turn one on from a paused listing and we&apos;ll let you
                    know the moment it&apos;s back.
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
                {waitlists.alerts.map((row) => (
                  <AlertCard key={row.id} row={row} />
                ))}
                {visibleNotified.map((row) => (
                  <ItsBackCard key={row.id} row={row} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ResumeModal className="max-w-[80vw]">
          <PDFPreview url={resumeURL} />
        </ResumeModal>
      </div>
    </div>
  );
}

const AlertCard = ({ row }: { row: JobWaitlist }) => {
  const router = useRouter();
  const waitlistActions = useWaitlistActions();
  const canOpenListing = !!row.job.id && !!row.job.is_active && !row.job.is_deleted;
  const listingHref = `/search/${row.job.id}`;

  const handleTurnOff = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const response = await waitlistActions.leave.mutateAsync(row.job_id);
      if (response.message) toast.error(response.message);
    } catch {
      toast.error("Couldn't update your alert. Please try again.");
    }
  };

  return (
    <Card
      role={canOpenListing ? "link" : undefined}
      tabIndex={canOpenListing ? 0 : undefined}
      onClick={() => canOpenListing && router.push(listingHref)}
      className={cn(
        "rounded-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        canOpenListing &&
          "cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary/20",
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge type="default">
            <Bell className="h-3 w-3 mr-1" />
            Alert set · {formatTimeAgo(row.created_at)}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={waitlistActions.leave.isPending}
            onClick={(event) => void handleTurnOff(event)}
          >
            Turn off alert
          </Button>
        </div>
        <JobHead title={row.job.title} employer={row.job.employer?.name} />
      </div>
    </Card>
  );
};

const ItsBackCard = ({ row }: { row: JobWaitlist }) => {
  const router = useRouter();
  const listingHref = `/search/${row.job.id}`;
  const goToListing = () => router.push(listingHref);

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={goToListing}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goToListing();
        }
      }}
      className="rounded-[0.16em] cursor-pointer transition-colors hover:bg-gray-50 hover:border-supportive/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge type="supportive">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            It&apos;s back!
          </Badge>
          <Button
            type="button"
            scheme="supportive"
            size="sm"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goToListing();
            }}
          >
            Apply now
          </Button>
        </div>
        <JobHead title={row.job.title} employer={row.job.employer?.name} />
      </div>
    </Card>
  );
};

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
  const appliedAtIso = application.applied_at
    ? new Date(application.applied_at).toISOString()
    : "";
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
              Applied {formatTimeAgo(appliedAtIso)}
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
