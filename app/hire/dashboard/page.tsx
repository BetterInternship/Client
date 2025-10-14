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
  const { ownedJobs, update_job }= useOwnedJobs();
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
      <div className="flex-1 flex flex-col w-full">
        <h3 className="p-4 m-4 text-primary">Welcome {profile.data?.name}</h3>
        <div className="p-6 flex flex-col h-0 flex-1 space-y-6">
          {!profile.loading && !profile.data?.is_verified ? (
            <ShowUnverifiedBanner />
          ) : (
            <>
              <Card className="h-full max-h-full border-none p-0 pt-2">
                <>
                <p className="m-4 text-gary-500">Current Jobs ({ownedJobs.length}): </p>
                {/* the commented out tab group is from the old tabs thing */}
                {/* <TabGroup>
                  <Tab
                    onTabChange={handleJobBack}
                    indicator={applications.employer_applications
                      .filter((application) => application.status === 0)
                      .some((application) =>
                        conversations.unreads.some((unread) =>
                          unread.subscribers.includes(application.user_id)
                        )
                      )}
                    name="New Applications"
                  >
                    {tabContents([0])}
                  </Tab>
                  
                  <Tab
                    onTabChange={handleJobBack}
                    name="Ongoing Applications"
                    indicator={applications.employer_applications
                      .filter((application) => application.status === 1)
                      .some((application) =>
                        conversations.unreads.some((unread) =>
                          unread.subscribers.includes(application.user_id)
                        )
                      )}
                  >
                    {tabContents([1])}
                  </Tab>
                  
                  <Tab
                    onTabChange={handleJobBack}
                    name="Finalized Applications"
                    indicator={applications.employer_applications
                      .filter((application) => application.status === 4 || application.status === 6)
                      .some((application) =>
                        conversations.unreads.some((unread) =>
                          unread.subscribers.includes(application.user_id)
                        )
                      )}
                  >
                    {tabContents([4, 6])}
                  </Tab>
                  <Tab
                    onTabChange={handleJobBack}
                    name="Archived Applications"
                    indicator={applications.employer_applications
                      .filter((application) => application.status === 0 || application.status === 1 ||
                      application.status === 4 || application.status === 6)
                      .some((application) =>
                        conversations.unreads.some((unread) =>
                          unread.subscribers.includes(application.user_id)
                        )
                      )}
                  >
                    {tabContents([0, 1, 4, 6])}
                  </Tab>
                </TabGroup> */}
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
