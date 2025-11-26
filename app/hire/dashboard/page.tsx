// Main dashboard page - uses clean architecture with focused hooks and context
// Wraps everything in DashboardProvider for shared state management
"use client";

import ContentLayout from "@/components/features/hire/content-layout";
import { JobsContent } from "@/components/features/hire/dashboard/JobsContent";
import { ShowUnverifiedBanner } from "@/components/ui/banner";
import { Loader } from "@/components/ui/loader";
import { useEmployerApplications, useOwnedJobs, useProfile } from "@/hooks/use-employer-api";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuthContext } from "../authctx";
import { Job } from "@/lib/db/db.types";

function DashboardContent() {
  const { isMobile } = useMobile();
  const { isAuthenticated, redirectIfNotLoggedIn, loading } = useAuthContext();
  const profile = useProfile();
  const applications = useEmployerApplications();
  const { ownedJobs, update_job, delete_job } = useOwnedJobs();
  const activeJobs = ownedJobs.filter((job) => job.is_active)
  const inactiveJobs = ownedJobs.filter((job) => !job.is_active)

  redirectIfNotLoggedIn();

  const handleUpdateJob = async (jobId: string, updates: Partial<Job>) => {
    const result = await update_job(jobId, updates);
    return result;
  }

  if (applications.loading) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading || !isAuthenticated())
    return <Loader>Loading dashboard...</Loader>;

  return (
    <ContentLayout>
      <div className={cn("flex-1 flex flex-col w-full py-4", isMobile ? "px-1" : "px-4")}>
        <h3 className="text-primary tracking-tighter">Welcome back, {profile.data?.name}</h3>
        <div className="flex flex-col flex-1">
          {!profile.loading && !profile.data?.is_verified ? (
            <ShowUnverifiedBanner />
          ) : (
            <>
              <div>
                <div className="flex gap-4 mb-4">
                  <span className="text-gray-500 pb-2"><span className="text-primary font-bold">{activeJobs.length}</span> active listing/s</span>
                  <span className="text-gray-500 pb-2"><span className="text-primary font-bold">{inactiveJobs.length}</span> inactive listing/s</span>
                </div>
                <>
                  <JobsContent
                    applications={applications.employer_applications}
                    jobs={ownedJobs}
                    employerId={profile.data?.id || ""}
                    updateJob={handleUpdateJob}
                  />
                  {isMobile && (
                    <Link href="listings/create">
                      <button
                        aria-label="Create new listing"
                        className="fixed bottom-8 right-2 bg-primary rounded-full p-5 z-10 shadow-xl z-[1000]"
                      >
                        <Plus className="h-5 w-5 text-white"/>
                      </button>
                    </Link>
                  )}
                </>
              </div>
            </>
          )}
        </div>
      </div>
    </ContentLayout>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
