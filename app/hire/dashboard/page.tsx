// Main dashboard page - uses clean architecture with focused hooks and context
// Wraps everything in DashboardProvider for shared state management
"use client";

import ContentLayout from "@/components/features/hire/content-layout";
import { ApplicationsContent } from "@/components/features/hire/dashboard/ApplicationsContent";
import { JobsContent } from "@/components/features/hire/dashboard/JobsContent";
import { ReviewModalContent } from "@/components/features/hire/dashboard/ReviewModalContent";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { ShowUnverifiedBanner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Message } from "@/components/ui/messages";
import { Tab, TabGroup } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useEmployerApplications, useOwnedJobs, useProfile } from "@/hooks/use-employer-api";
import { useFile } from "@/hooks/use-file";
import { useModal } from "@/hooks/use-modal";
import { useSideModal } from "@/hooks/use-side-modal";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { EmployerApplication } from "@/lib/db/db.types";
import { getFullName } from "@/lib/utils/user-utils";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, MessageCircle, SendHorizonal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "../authctx";

function DashboardContent() {
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

  //shows applications when job listing is clicked
  const handleJobListingClick = (jobId: string, statusId: number[]) => {
    setSelectedJobId(jobId);
    setFilteredStatus(statusId);
    setViewMode('applications');
  };

  //sets the job list
  const handleJobBack = () => {
    setViewMode('jobs');
    setSelectedJobId(null);
    setFilteredStatus([]);
  }

  const handleCurrentStatus = (application: EmployerApplication) => {

  }

  const handleStatusChange = (
    application: EmployerApplication,
    status: number
  ) => {
    applications.review(application.id ?? "", { status });
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
    //! big change is moving the tab group from ApplicationsTable to the page here for both access to jobs and applications
    <ContentLayout>
      <div className="flex-1 flex flex-col w-full">
        <div className="p-6 flex flex-col h-0 flex-1 space-y-6">
          {!profile.loading && !profile.data?.is_verified ? (
            <ShowUnverifiedBanner />
          ) : (
            // <ApplicationsTable
            //   applications={applications.employer_applications}
            //   jobs={jobs.ownedJobs}
            //   openChatModal={openChatModal}
            //   updateConversationId={updateConversationId}
            //   onApplicationClick={handleApplicationClick}
            //   onNotesClick={handleNotesClick}
            //   onScheduleClick={handleScheduleClick}
            //   onJobListingClick={handleJobListingClick}
            //   onStatusChange={handleStatusChange}
            //   setSelectedApplication={setSelectedApplication}
            // />
            <>
              {/* {viewMode === 'applications' && (
                <Button
                  variant="outline"
                  onClick={handleJobBack}
                  className="mb-4 w-fit"
                >
                  Back
                </Button>
              )} */}
              <Card className="overflow-auto h-full max-h-full border-none p-0 pt-2">
                <>
                <TabGroup>
                  <Tab
                    indicator={applications.employer_applications
                      .filter((application) => application.status === 0)
                      .some((application) =>
                        conversations.unreads.some((unread) =>
                          unread.subscribers.includes(application.user_id)
                        )
                      )}
                    name="New Applications"
                  >
                    {viewMode === 'jobs' ? (
                      <JobsContent
                        applications={applications.employer_applications}
                        jobs={jobs.ownedJobs}
                        statusId={[0]}
                        employerId={profile.data?.id || ""}
                        onJobListingClick={handleJobListingClick}
                      />
                    ) : (
                      <>
                        <button
                          onClick={handleJobBack}
                          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <ApplicationsContent
                        applications={filteredApplications}
                        statusId={[0]}
                        openChatModal={openChatModal}
                        updateConversationId={updateConversationId}
                        onApplicationClick={handleApplicationClick}
                        onNotesClick={handleNotesClick}
                        onScheduleClick={handleScheduleClick}
                        onStatusChange={handleStatusChange}
                        setSelectedApplication={setSelectedApplication}
                        ></ApplicationsContent>
                      </>
                    )}
                  </Tab>
                  
                  <Tab
                    name="Ongoing Applications"
                    indicator={applications.employer_applications
                      .filter((application) => application.status === 1)
                      .some((application) =>
                        conversations.unreads.some((unread) =>
                          unread.subscribers.includes(application.user_id)
                        )
                      )}
                  >
                    {viewMode === 'jobs' ? (
                      <JobsContent
                        applications={applications.employer_applications}
                        jobs={jobs.ownedJobs}
                        statusId={[1]}
                        employerId={profile.data?.id || ""}
                        onJobListingClick={handleJobListingClick}
                      />
                    ) : (
                      <>
                        <button
                          onClick={handleJobBack}
                          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <ApplicationsContent
                        applications={filteredApplications}
                        statusId={[1]}
                        openChatModal={openChatModal}
                        updateConversationId={updateConversationId}
                        onApplicationClick={handleApplicationClick}
                        onNotesClick={handleNotesClick}
                        onScheduleClick={handleScheduleClick}
                        onStatusChange={handleStatusChange}
                        setSelectedApplication={setSelectedApplication}
                        ></ApplicationsContent>
                      </>
                    )}
                  </Tab>
                  
                  <Tab
                    name="Finalized Applications"
                    indicator={applications.employer_applications
                      .filter((application) => application.status === 4 || application.status === 6)
                      .some((application) =>
                        conversations.unreads.some((unread) =>
                          unread.subscribers.includes(application.user_id)
                        )
                      )}
                  >
                    {viewMode === 'jobs' ? (
                      <JobsContent
                        applications={applications.employer_applications}
                        jobs={jobs.ownedJobs}
                        statusId={[4, 6]}
                        employerId={profile.data?.id || ""}
                        onJobListingClick={handleJobListingClick}
                      />
                    ) : (
                      <>
                        <button
                          onClick={handleJobBack}
                          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <ApplicationsContent
                        applications={filteredApplications}
                        statusId={[4, 6]}
                        openChatModal={openChatModal}
                        updateConversationId={updateConversationId}
                        onApplicationClick={handleApplicationClick}
                        onNotesClick={handleNotesClick}
                        onScheduleClick={handleScheduleClick}
                        onStatusChange={handleStatusChange}
                        setSelectedApplication={setSelectedApplication}
                        ></ApplicationsContent>
                      </>
                    )}
                  </Tab>
                  <Tab
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
                    {viewMode === 'jobs' ? (
                      <JobsContent
                        applications={applications.employer_applications}
                        jobs={archivedJobs}
                        statusId={[0, 1, 4, 6]}
                        employerId={profile.data?.id || ""}
                        onJobListingClick={handleJobListingClick}
                      />
                    ) : (
                      <>
                        <button
                          onClick={handleJobBack}
                          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <ApplicationsContent
                        applications={filteredApplications}
                        statusId={[0, 1, 4, 6]}
                        openChatModal={openChatModal}
                        updateConversationId={updateConversationId}
                        onApplicationClick={handleApplicationClick}
                        onNotesClick={handleNotesClick}
                        onScheduleClick={handleScheduleClick}
                        onStatusChange={handleStatusChange}
                        setSelectedApplication={setSelectedApplication}
                        ></ApplicationsContent>
                      </>
                    )}
                  </Tab>
                </TabGroup>
                </>
              </Card>
            </>
          )}
        </div>
      </div>

      <ApplicantModal className="max-w-7xl w-full">
        <ApplicantModalContent
          is_employer={true}
          clickable={true}
          pfp_fetcher={async () =>
            UserService.getUserPfpURL(selectedApplication?.user?.id ?? "")
          }
          pfp_route={`/users/${selectedApplication?.user_id}/pic`}
          applicant={selectedApplication?.user}
          open_calendar={async () => {
            closeApplicantModal();
            window
              ?.open(selectedApplication?.user?.calendar_link ?? "", "_blank")
              ?.focus();
          }}
          open_resume={async () => {
            closeApplicantModal();
            await syncResumeURL();
            openResumeModal();
          }}
          job={selectedApplication?.job}
          resume_url={resumeURL}
        />
      </ApplicantModal>

      <ReviewModal>
        {selectedApplication && (
          <ReviewModalContent
            application={selectedApplication}
            reviewApp={async (id, reviewOptions) => {
              await reviewApp(id, reviewOptions);
              // ! lol remove this later on
              selectedApplication.notes = reviewOptions.notes;
            }}
            onClose={closeReviewModal}
          />
        )}
      </ReviewModal>

      <ResumeModal>
        {selectedApplication?.user?.resume ? (
          <div className="h-full flex flex-col">
            <h1 className="font-bold font-heading text-2xl px-6 py-4 text-gray-900">
              {getFullName(selectedApplication?.user)} - Resume
            </h1>
            <PDFPreview url={resumeURL} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 px-8">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="font-heading font-bold text-2xl mb-4 text-gray-700">
                No Resume Available
              </h1>
              <div className="max-w-md text-center border border-red-200 text-red-600 bg-red-50 rounded-lg p-4">
                This applicant has not uploaded a resume yet.
              </div>
            </div>
          </div>
        )}
      </ResumeModal>

      <ChatModal>
        <div className="relative p-6 pt-6 pb-20 h-full w-full">
          <div className="flex flex-col h-[100%] w-full gap-6">
            <div className="text-4xl font-bold tracking-tight">
              {getFullName(selectedApplication?.user)}
            </div>
            <div className="overflow-y-hidden flex-1 border border-gray-300 rounded-[0.33em] max-h-[75%]">
              <div className="flex flex-col-reverse max-h-full min-h-full overflow-y-scroll p-2 gap-1">
                <div ref={chatAnchorRef} />
                {conversation?.loading ?? true ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader>Loading conversation...</Loader>
                  </div>
                ) : conversation?.messages?.length ? (
                  conversation.messages
                    ?.map((message: any, idx: number) => {
                      if (!idx) lastSelf = false;
                      const oldLastSelf = lastSelf;
                      lastSelf = message.sender_id === profile.data?.id;
                      return {
                        key: idx,
                        message: message.message,
                        self: message.sender_id === profile.data?.id,
                        prevSelf: oldLastSelf,
                        them: getFullName(selectedApplication?.user),
                      };
                    })
                    ?.toReversed()
                    ?.map((d: any) => (
                      <Message
                        key={d.key}
                        message={d.message}
                        self={d.self}
                        prevSelf={d.prevSelf}
                        them={d.them}
                      />
                    ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="flex flex-col text-left gap-1 p-4 px-6 border-transparent">
                        <MessageCircle className="w-16 h-16 my-4 opacity-50" />
                        <div className="text-xl font-bold">
                          Send a Message Now!
                        </div>
                        You don't have any messages with this applicant yet.
                      </Card>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
            <Textarea
              ref={messageInputRef}
              placeholder="Send a message here..."
              className="w-full h-20 p-3 border-gray-200 rounded-[0.33em] focus:ring-0 focus:ring-transparent resize-none text-sm overflow-y-auto"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!selectedApplication?.user_id) return;
                  if (messageInputRef.current?.value) {
                    handleMessage(
                      selectedApplication.user_id,
                      messageInputRef.current.value
                    );
                  }
                }
              }}
              maxLength={1000}
            />
            <Button
              size="md"
              disabled={sending}
              onClick={() => {
                if (!selectedApplication?.user_id) return;
                if (messageInputRef.current?.value) {
                  handleMessage(
                    selectedApplication?.user_id,
                    messageInputRef.current?.value
                  );
                }
              }}
            >
              {sending ? "Sending..." : "Send Message"}
              <SendHorizonal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </ChatModal>
    </ContentLayout>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
