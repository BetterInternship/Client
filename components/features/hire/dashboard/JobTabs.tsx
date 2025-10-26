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
import { JobDetails } from "@/components/shared/jobs";
import { Job } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import {
  ListingsDetailsPanel,
} from "@/components/features/hire/listings";
import { ReviewModalContent } from "@/components/features/hire/dashboard/ReviewModalContent";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { Message } from "@/components/ui/messages";
import { Textarea } from "@/components/ui/textarea";
import { getFullName } from "@/lib/profile";
import { motion } from "framer-motion";
import { FileText, MessageCircle, SendHorizonal } from "lucide-react";
import { useListingsBusinessLogic } from "@/hooks/hire/listings/use-listings-business-logic";
import { Scrollbar } from "@/components/ui/scroll-area";


interface JobTabsProps {
  selectedJob: Job | null;
}

export default function JobTabs({selectedJob}: JobTabsProps) {
    const { ownedJobs, update_job, delete_job } = useOwnedJobs();
  
    // Business logic hook
    const {
      searchTerm,
      saving,
      isEditing,
      jobsPage,
      jobsPageSize,
      filteredJobs,
      setSearchTerm,
      handleKeyPress,
      handleJobSelect,
      handleEditStart,
      handleSave,
      handleCancel,
      handleShare,
      clearSelectedJob,
      handlePageChange,
      openDeleteModal,
      closeDeleteModal,
      DeleteModal,
      setIsEditing,
    } = useListingsBusinessLogic(ownedJobs);
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

    const [selectedJobId, setSelectedJobId] =
    useState<string | null>(null);
    const [filteredStatus, setFilteredStatus] =
    useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
    const [jobName, setJobName] =
    useState<string>("");

    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const chatAnchorRef = useRef<HTMLDivElement>(null);
    const [lastSending, setLastSending] = useState(false);
    const [sending, setSending] = useState(false);
    const conversation = useConversation("employer", conversationId);

    const router = useRouter();

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

  useEffect(() => {
    if(!selectedJobId && selectedJob?.id) {
      setSelectedJobId(selectedJob?.id)
    }
  }, [selectedJobId])

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

  //goes back to job list
    const handleJobBack = () => {
        router.push("/dashboard");
    };

  const handleStatusChange = (
    application: EmployerApplication,
    status: number
  ) => {
    applications.review(application.id ?? "", { status });
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

    const viewListingTab = () => {
      //listings details panel ekek
      // import {
      //   ListingsDetailsPanel,
      // } from "@/components/features/hire/listings";
      // ^^^ from here i thibk :D

      <div className="flex-1 min-w-0">
              <Scrollbar>
                <ListingsDetailsPanel
                  selectedJob={selectedJob}
                  isEditing={isEditing}
                  saving={saving}
                  onEdit={handleEditStart}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onShare={handleShare}
                  onDelete={openDeleteModal}
                  updateJob={update_job}
                  setIsEditing={setIsEditing}
                />
              </Scrollbar>
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
        <>
          <div className="flex-1 flex flex-col w-full">
            <div className="flex items-center pl-4 pt-2">
              <button
              onClick={handleJobBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
              >
                  <ArrowLeft className="s-8" />
              </button>
              <h3 className="m-3">{selectedJob?.title}</h3>
            </div>
            <div className="px-8 flex flex-col flex-1 space-y-6">
                {!profile.loading && !profile.data?.is_verified ? (
                    <ShowUnverifiedBanner />
                ) : (
                    <>
                      <TabGroup>
                        <Tab
                        name="Applicants"
                        >
                            {/* we need to add filtering here :D */}
                            <ApplicationsContent
                              applications={filteredApplications}
                              statusId={[0, 1, 2, 3, 4, 5, 6]}
                              openChatModal={openChatModal}
                              updateConversationId={updateConversationId}
                              onApplicationClick={handleApplicationClick}
                              onNotesClick={handleNotesClick}
                              onScheduleClick={handleScheduleClick}
                              onStatusChange={handleStatusChange}
                              setSelectedApplication={setSelectedApplication}
                            ></ApplicationsContent>
                        </Tab>
                        <Tab
                        name="Preview Listing"
                        >
                            <Card className="flex-1 min-w-0">
                              <Scrollbar>
                                <ListingsDetailsPanel
                                  selectedJob={selectedJob}
                                  isEditing={isEditing}
                                  saving={saving}
                                  onEdit={handleEditStart}
                                  onSave={handleSave}
                                  onCancel={handleJobBack}
                                  onShare={handleShare}
                                  onDelete={openDeleteModal}
                                  updateJob={update_job}
                                  setIsEditing={setIsEditing}
                                />
                              </Scrollbar>
                            </Card>
                        </Tab>
                      </TabGroup>
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
      </>
    )
}