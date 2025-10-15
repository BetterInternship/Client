// Main dashboard page - uses clean architecture with focused hooks and context
// Wraps everything in DashboardProvider for shared state management
"use client";

import ContentLayout from "@/components/features/hire/content-layout";
import { JobsContent } from "@/components/features/hire/dashboard/JobsContent";
import { ReviewModalContent } from "@/components/features/hire/dashboard/ReviewModalContent";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { ShowUnverifiedBanner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Message } from "@/components/ui/messages";
import { Textarea } from "@/components/ui/textarea";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useEmployerApplications, useOwnedJobs, useProfile } from "@/hooks/use-employer-api";
import { useFile } from "@/hooks/use-file";
import { useModal } from "@/hooks/use-modal";
import { useSideModal } from "@/hooks/use-side-modal";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { EmployerApplication } from "@/lib/db/db.types";
import { getFullName } from "@/lib/profile";
import { motion } from "framer-motion";
import { FileText, MessageCircle, SendHorizonal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "../authctx";

function DashboardContent() {
  const { isAuthenticated, redirectIfNotLoggedIn, loading } = useAuthContext();
  const profile = useProfile();
  const applications = useEmployerApplications();
  const { ownedJobs, update_job } = useOwnedJobs();
  const archivedJobs = ownedJobs.filter((job) => job.is_active === false ||
    job.is_deleted === true || job.is_unlisted === true);

  const [selectedJobId, setSelectedJobId] =
    useState<string | null>(null);
  const [filteredStatus, setFilteredStatus] =
    useState<number[]>([]);
  const [jobName, setJobName] =
    useState<string>("");

  redirectIfNotLoggedIn();

  //shows applications when job listing is clicked
  const handleJobListingClick = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setJobName(jobTitle);
  };

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

  // ! remove, find a better way
  let lastSelf = false;

  return (
    <ContentLayout>
      <div className="flex-1 flex flex-col w-full px-6 py-4 gap-4 mt-4">
        <h3 className="text-primary tracking-tighter">Welcome back, {profile.data?.name}</h3>
        <div className="flex flex-col flex-1">
          {!profile.loading && !profile.data?.is_verified ? (
            <ShowUnverifiedBanner />
          ) : (
            <>
              <Card className="h-full max-h-full border-none">
                {ownedJobs.length === 1 ? (
                  <p className="text-gray-500 pb-2">{ownedJobs.length} job listing </p>
                ) : (
                  <p className="text-gray-500 pb-2">{ownedJobs.length} job listings </p>
                )}
                <>
                  <JobsContent
                    applications={applications.employer_applications}
                    jobs={ownedJobs}
                    employerId={profile.data?.id || ""}
                    onJobListingClick={handleJobListingClick}
                    updateJob={update_job}
                  />
                </>
              </Card>
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
