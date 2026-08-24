"use client";

import { JobsContent } from "@/components/features/hire/dashboard/JobsContent";
import { Loader } from "@/components/ui/loader";
import {
  useEmployerApplications,
  useOwnedJobs,
  useProfile,
} from "@/hooks/use-employer-api";
import { useAuthContext } from "../authctx";
import { Job } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  PageContainer,
  PageHeader,
} from "@betterinternship/components/page-header";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { Button } from "@betterinternship/components";
import { Pause, Plus } from "lucide-react";

const NORMAL_LISTING_CREATE_PATH = "/listings/create";

function DashboardContent() {
  const { isAuthenticated, redirectIfNotLoggedIn } = useAuthContext();
  const router = useRouter();
  const profile = useProfile();
  const applications = useEmployerApplications();
  const { ownedJobs, update_job, unpause_job, unpause_all_jobs, loading } =
    useOwnedJobs();
  const activeJobs = ownedJobs.filter((job) => job.is_active);
  const inactiveJobs = ownedJobs.filter((job) => !job.is_active);
  const pausedJobs = ownedJobs.filter((job) => job.paused).length;
  const [reEnabling, setReEnabling] = useState(false);

  redirectIfNotLoggedIn();

  const handleAddListingClick = () => {
    router.push(NORMAL_LISTING_CREATE_PATH);
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<Job>) => {
    const result = await update_job(jobId, updates);
    return result;
  };

  if (loading || !isAuthenticated()) {
    return (
      <PageContainer>
        <Loader>Loading dashboard...</Loader>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Job listings"
        description="Manage your job listings here."
        actionsClassName="self-center sm:self-auto"
      >
        <Button
          asChild
          size="icon"
          className="sm:h-8 sm:w-auto sm:px-[1em] sm:py-[0.33em]"
        >
          <Link href={NORMAL_LISTING_CREATE_PATH} aria-label="Add listing">
            <Plus />
            <span className="hidden sm:inline">Add listing</span>
          </Link>
        </Button>
      </PageHeader>
      <div className="flex-1 flex flex-col">
        {pausedJobs !== 0 && (
          <StatusNotice
            icon={Pause}
            title="Paused listings"
            description={`You have ${pausedJobs} paused listing${pausedJobs !== 1 ? "s" : ""}.`}
            variant="warning"
            action={
              <Button
                size="sm"
                variant="outline"
                scheme="primary"
                disabled={reEnabling}
                onClick={() => {
                  setReEnabling(true);
                  void unpause_all_jobs();
                  setReEnabling(false);
                }}
              >
                {reEnabling ? "Re-activating..." : "Re-activate all"}
              </Button>
            }
          />
        )}
        <div className="flex flex-col flex-1">
          <div>
            <div className="flex gap-4 mb-4">
              <span className="text-muted-foreground">
                <span className="text-primary font-bold">
                  {activeJobs.length}
                </span>{" "}
                listing{activeJobs.length !== 1 ? "s" : ""} turned on
              </span>
              <span className="text-muted-foreground">
                <span className="text-primary font-bold">
                  {inactiveJobs.length}
                </span>{" "}
                listing{inactiveJobs.length !== 1 ? "s" : ""} turned off
              </span>
            </div>
            <JobsContent
              applications={applications.employer_applications}
              jobs={ownedJobs}
              employerId={profile.data?.id || ""}
              updateJob={handleUpdateJob}
              onReactivate={unpause_job}
              onAddListingClick={handleAddListingClick}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
