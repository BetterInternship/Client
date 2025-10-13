"use client";

import { useAuthContext } from "@/app/hire/authctx";
import ContentLayout from "@/components/features/hire/content-layout";
import { ApplicationsContent } from "@/components/features/hire/dashboard/ApplicationsContent";
import { ShowUnverifiedBanner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Tab, TabGroup } from "@/components/ui/tabs";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useEmployerApplications, useOwnedJobs, useProfile } from "@/hooks/use-employer-api";
import { useFile } from "@/hooks/use-file";
import { useModal } from "@/hooks/use-modal";
import { useSideModal } from "@/hooks/use-side-modal";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { EmployerApplication } from "@/lib/db/db.types";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function JobTabs() {
    const { isAuthenticated, redirectIfNotLoggedIn, loading } = useAuthContext();
    const profile = useProfile();
    const applications = useEmployerApplications();
    const jobs = useOwnedJobs();
    const archivedJobs = jobs.ownedJobs.filter((job) => job.is_active === false ||
        job.is_deleted === true || job.is_unlisted === true);
    
    const [selectedApplication, setSelectedApplication] =
    useState<EmployerApplication | null>(null);
    
    const [conversationId, setConversationId] = useState("");
    const conversations = useConversations();
    const updateConversationId = (userId: string) => {
        let userConversation = conversations.data?.find((c) =>
            c?.subscribers?.includes(userId)
        );
        setConversationId(userConversation?.id);
    };

    const [viewMode, setViewMode] = useState<'jobs' | 'applications'>('jobs');
    const [selectedJobId, setSelectedJobId] =
    useState<string | null>(null);
    const [filteredStatus, setFilteredStatus] =
    useState<number[]>([]);
    const [jobName, setJobName] =
    useState<string>("");

    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const chatAnchorRef = useRef<HTMLDivElement>(null);
    const [lastSending, setLastSending] = useState(false);
    const [sending, setSending] = useState(false);
    const conversation = useConversation("employer", conversationId);

  // Fetch a presigned resume URL for the currently selected user
  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: useCallback(
      async () =>
        await UserService.getUserResumeURL(selectedApplication?.user_id ?? ""),
      [selectedApplication?.user_id]
    ),
    route: selectedApplication
      ? `/users/${selectedApplication.user_id}/resume`
      : "",
  });

  // Refresh presigned URL whenever the selected applicant changes
  useEffect(() => {
    if (selectedApplication?.user_id) {
      syncResumeURL();
    }
  }, [selectedApplication?.user_id, syncResumeURL]);

  const endSend = () => {
    setSending(false);
    setTimeout(() => {
      chatAnchorRef.current?.scrollIntoView({ behavior: "instant" });
    }, 100);
  };

  useEffect(() => {
    setLastSending(sending);
  }, [sending]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!sending && !lastSending)
      timeout = setTimeout(() => messageInputRef.current?.focus(), 200);
    return () => timeout && clearTimeout(timeout);
  }, [lastSending]);

  // Handle message
  const handleMessage = async (userId: string, message: string) => {
    if (message.trim() === "") return;

    setSending(true);
    let userConversation = conversations.data?.find((c) =>
      c?.subscribers?.includes(userId)
    );

    // Create convo if it doesn't exist first
    if (!userConversation) {
      const response = await EmployerConversationService.createConversation(
        userId
      ).catch(endSend);

      if (!response?.success) {
        alert("Could not initiate conversation with user.");
        endSend();
        return;
      }

      // Update the conversation
      setConversationId(response.conversation?.id ?? "");
      userConversation = response.conversation;
      endSend();
    }

    setTimeout(async () => {
      if (!userConversation) return endSend();
      await EmployerConversationService.sendToUser(
        userConversation?.id,
        message
      ).catch(endSend);
      endSend();
    });
  };

  const {
    open: openChatModal,
    close: closeChatModal,
    SideModal: ChatModal,
  } = useSideModal("chat-modal", {
    onClose: () => (conversation.unsubscribe(), setConversationId("")),
  });

  const {
    open: openApplicantModal,
    close: closeApplicantModal,
    Modal: ApplicantModal,
  } = useModal("applicant-modal");

  const {
    open: openReviewModal,
    close: closeReviewModal,
    Modal: ReviewModal,
  } = useModal("review-modal");

  const {
    open: openResumeModal,
    close: closeResumeModal,
    Modal: ResumeModal,
  } = useModal("resume-modal");

  // Wrapper for review function to match expected signature
  const reviewApp = (
    id: string,
    reviewOptions: { review?: string; notes?: string; status?: number }
  ) => {
    if (reviewOptions.notes)
      applications.review(id, { review: reviewOptions.notes });

    if (reviewOptions.status !== undefined)
      applications.review(id, { status: reviewOptions.status });
  };

  //gets applications for the specific job id
    const filteredApplications = selectedJobId
    ? applications.employer_applications.filter(application =>
        application.job_id === selectedJobId &&
        (filteredStatus.includes(0) ? true : application.status !== undefined && filteredStatus.includes(application.status))
        )
    : applications.employer_applications;


    redirectIfNotLoggedIn();

  const handleApplicationClick = (application: EmployerApplication) => {
    setSelectedApplication(application); // set first
    openApplicantModal(); // then open
  };

  const handleNotesClick = (application: EmployerApplication) => {
    openReviewModal();
    setSelectedApplication(application);
  };

  const handleScheduleClick = (application: EmployerApplication) => {
    setSelectedApplication(application);
    window?.open(application.user?.calendar_link ?? "", "_blank");
  };

  //sets the job list
    const handleJobBack = () => {
        setSelectedJobId(null);
        setFilteredStatus([]);
        setJobName("");
        window.location.href=""
    };

  const handleStatusChange = (
    application: EmployerApplication,
    status: number
  ) => {
    applications.review(application.id ?? "", { status });
  };

  const tabContents = (status: number[]) => {
    return viewMode === 'jobs' ? (
        <>
          <div className="flex items-center gap-4 w-full max-w-2xl m-4">
          </div>
          {/* <JobsContent
            applications={applications.employer_applications}
            jobs={jobs.ownedJobs}
            statusId={status}
            employerId={profile.data?.id || ""}
            onJobListingClick={handleJobListingClick}
          /> */}
        </>
      ) : (
        <div>
          <div className="flex items-center bg-white">
              <button
                onClick={handleJobBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="font-medium text-gray-900 text-base truncate">
                Applications for: <strong>{jobName}</strong>
              </h2>
              <Button
                variant="outline"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="m-4 p-4"
              >
              </Button>
        </div>
        <ApplicationsContent
          applications={filteredApplications}
          statusId={status}
          openChatModal={openChatModal}
          updateConversationId={updateConversationId}
          onApplicationClick={handleApplicationClick}
          onNotesClick={handleNotesClick}
          onScheduleClick={handleScheduleClick}
          onStatusChange={handleStatusChange}
          setSelectedApplication={setSelectedApplication}
        ></ApplicationsContent>
      </div>
    );
  };

    const applicantsTab = (status: number[]) => {
        <div>
        <ApplicationsContent
          applications={filteredApplications}
          statusId={status}
          openChatModal={openChatModal}
          updateConversationId={updateConversationId}
          onApplicationClick={handleApplicationClick}
          onNotesClick={handleNotesClick}
          onScheduleClick={handleScheduleClick}
          onStatusChange={handleStatusChange}
          setSelectedApplication={setSelectedApplication}
        ></ApplicationsContent>
      </div>
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

  // ! remove, find a better way
    let lastSelf = false;

    return (
        <ContentLayout>
            <div className="flex-1 flex flex-col w-full">
                <button
                onClick={handleJobBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="font-medium text-gray-900 text-base truncate">
                    {jobName}
                </h2>
                <div className="p-6 flex flex-col h-0 flex-1 space-y-6">
                    {!profile.loading && !profile.data?.is_verified ? (
                        <ShowUnverifiedBanner />
                    ) : (
                        <>
                            <Card className="overflow-auto h-full max-h-full border-none p-0 pt-2">
                                <TabGroup>
                                    <Tab
                                    name="Applicants"
                                    >
                                        <p>poop</p>
                                    </Tab>
                                    <Tab
                                    name="Preview Listing"
                                    >
                                        <p>peanuts</p>
                                    </Tab>
                                </TabGroup>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </ContentLayout>
    )
}