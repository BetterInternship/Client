"use client";

import { useAuthContext } from "@/app/hire/authctx";
import { ApplicationsContent } from "@/components/features/hire/dashboard/ApplicationsContent";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import {
  useEmployerApplications,
  useOwnedJobs,
  useProfile,
} from "@/hooks/use-employer-api";
import { useFile } from "@/hooks/use-file";
import { useModal } from "@/hooks/use-modal";
import { useSideModal } from "@/hooks/use-side-modal";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { EmployerApplication, InternshipPreferences } from "@/lib/db/db.types";
import { ArrowLeft, Edit, Info, Trash2, MessageSquarePlus, MessageSquareText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Job } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { ReviewModalContent } from "@/components/features/hire/dashboard/ReviewModalContent";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { Message } from "@/components/ui/messages";
import { Textarea } from "@/components/ui/textarea";
import { getFullName } from "@/lib/profile";
import { motion } from "framer-motion";
import { FileText, MessageCirclePlus, SendHorizonal, SquareArrowOutUpRight } from "lucide-react";
import { useListingsBusinessLogic } from "@/hooks/hire/listings/use-listings-business-logic";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";
import { ListingsDeleteModal } from "@/components/features/hire/listings";
import { Toggle } from "@/components/ui/toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animata/fade";

interface JobTabsProps {
  selectedJob: Job | null;
  onJobUpdate?: (updates: Partial<Job>) => void;
}

export default function JobTabs({ 
  selectedJob,
  onJobUpdate,
} : JobTabsProps) {
  const { ownedJobs, update_job, delete_job } = useOwnedJobs();

  // Business logic hook
  const {
    saving,
    clearSelectedJob,
  } = useListingsBusinessLogic(ownedJobs);
  const { isAuthenticated, redirectIfNotLoggedIn, loading } = useAuthContext();
  const profile = useProfile();
  const applications = useEmployerApplications();
  const [isLoading, setLoading] = useState(true);

  const [selectedApplication, setSelectedApplication] =
    useState<EmployerApplication | null>(null);

  const [conversationId, setConversationId] = useState("");
  const conversations = useConversations();
  const updateConversationId = (userId: string) => {
    let userConversation = conversations.data?.find((c) =>
      c?.subscribers?.includes(userId),
    );
    setConversationId(userConversation?.id);
  };

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filteredStatus, setFilteredStatus] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [applicantToDelete, setApplicantToDelete] = useState<EmployerApplication | null>(null);
  const [statusChangeData, setStatusChangeData] = useState<{ applicants: EmployerApplication[]; status: number; } | null>(null);

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatAnchorRef = useRef<HTMLDivElement>(null);
  const [lastSending, setLastSending] = useState(false);
  const [sending, setSending] = useState(false);
  const conversation = useConversation("employer", conversationId);

  const { isMobile } = useAppContext();

  const router = useRouter();

  const applicationContentRef = useRef<{ unselectAll: () => void }>(null);

  // Fetch a presigned resume URL for the currently selected user
  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: useCallback(
      async () =>
        await UserService.getUserResumeURL(selectedApplication?.user_id ?? ""),
      [selectedApplication?.user_id],
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
    if (selectedJob?.id) {
      setSelectedJobId(selectedJob?.id);
      setLoading(true)

      const timer = setTimeout(() => {
        setLoading(false);
      }, 400);
    
      return () => clearTimeout(timer);
    }
  }, [selectedJob?.id]);

  const handleToggleActive = async () => {
    if (!selectedJob?.id) return;

    const updates = { is_active: !selectedJob.is_active };
    const result = await update_job(selectedJob.id, updates);

    if (result.success && onJobUpdate) {
      onJobUpdate(updates);
    }
  };

  const {
    open: openDeleteModal,
    close: closeDeleteModal,
    Modal: DeleteModal,
  } = useModal("delete-modal");

  const {
    open: openNewChatModal,
    close: closeNewChatModal,
    Modal: NewChatModal,
  } = useModal("new-chat-modal", {
    onClose: () => (conversation.unsubscribe(), setConversationId("")),
    showCloseButton: false,
  });

  const {
    open: openOldChatModal,
    close: closeOldChatModal,
    Modal: OldChatModal,
  } = useModal("old-chat-modal", {
    onClose: () => (conversation.unsubscribe(), setConversationId("")),
    showCloseButton: false,
  });
  
  const {
    open: openChatModal,
    close: closeChatModal,
    SideModal: ChatModal,
  } = useSideModal("chat-modal", {
    onClose: () => (conversation.unsubscribe(), setConversationId(""))
  });

  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.key === 'Escape') {
        closeChatModal();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeChatModal]);

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

  const {
    open: openApplicantDeleteModal,
    close: closeApplicantDeleteModal,
    Modal: ApplicantDeleteModal,
  } = useModal("applicant-delete-modal");

  const {
    open: openStatusChangeModal,
    close: closeStatusChangeModal,
    Modal: StatusChangeModal,
  } = useModal("mass-change-modal");

  // Wrapper for review function to match expected signature
  const reviewApp = (
    id: string,
    reviewOptions: { review?: string; notes?: string; status?: number },
  ) => {
    if (reviewOptions.notes)
      applications.review(id, { review: reviewOptions.notes });

    if (reviewOptions.status !== undefined)
      applications.review(id, { status: reviewOptions.status });
  };

  //gets applications for the specific job id
  const filteredApplications = selectedJobId
    ? applications.employer_applications.filter(
        (application) =>
          application.job_id === selectedJobId &&
          (filteredStatus.includes(0)
            ? true
            : application.status !== undefined &&
              filteredStatus.includes(application.status)),
      )
    : applications.employer_applications;

  redirectIfNotLoggedIn();

  const handleApplicationClick = (application: EmployerApplication) => {
    setSelectedApplication(application); // set first
    router.push(`/dashboard/applicant?userId=${application?.user_id}&jobId=${selectedJobId}`);
  };

  const handleNotesClick = (application: EmployerApplication) => {
    openReviewModal();
    setSelectedApplication(application);
  };

  const handleScheduleClick = (application: EmployerApplication) => {
    setSelectedApplication(application);
    window?.open(application.user?.calendar_link ?? "", "_blank");
  };

  const handleJobDelete = () => {
    if (selectedJob) {
      setJobToDelete(selectedJob);
      openDeleteModal();
    }
  };

  //goes back to job list
  const handleJobBack = () => {
    router.push("/dashboard");
  };

  const handleStatusChange = (
    application: EmployerApplication,
    status: number,
  ) => {
    applications.review(application.id ?? "", { status });
  };

  const handleRequestApplicantDelete = (application: EmployerApplication) => {
    setApplicantToDelete(application);
    openApplicantDeleteModal();
  };

  const handleConfirmApplicantDelete = async () => {
    if (!applicantToDelete?.id) return;
    await applications.review(applicantToDelete.id, { status: 7 });
    setApplicantToDelete(null);
    closeApplicantDeleteModal();
    applicationContentRef.current?.unselectAll();
  };

  const handleCancelApplicantDelete = () => {
    setApplicantToDelete(null);
    closeApplicantDeleteModal();
  };

  const onChatClick = async () => {
    if (!selectedApplication?.user_id) return;

    const userConversation = conversations.data?.find((c) =>
      c?.subscribers?.includes(selectedApplication?.user_id)
    );

    if(userConversation){
      setConversationId(userConversation.id);
      openOldChatModal();
    } else {
      openNewChatModal();
    }
  };

  const handleRequestStatusChange = (
    applicants: EmployerApplication[],
    status: number,
  ) => {
    setStatusChangeData({ applicants, status });
    openStatusChangeModal();
  };

  const handleCancelStatusChange = () => {
    setStatusChangeData(null);
    closeStatusChangeModal();
  }

  const handleConfirmStatusChange = async () => {
    if (!statusChangeData) return;

    await Promise.all(
      statusChangeData.applicants.map((app) =>
        applications.review(app.id ?? "", { status: statusChangeData.status })
      )
    );

    setStatusChangeData(null);
    closeStatusChangeModal();
    applicationContentRef.current?.unselectAll();
  };

  // Handle message
    const handleMessage = async (studentId: string | undefined, message: string) => {
        if (message.trim() === "") return;

        setSending(true);
        let userConversation = conversations.data?.find((c) =>
        c?.subscribers?.includes(studentId),
        );

        if (!userConversation && studentId) {
        const response =
            await EmployerConversationService.createConversation(studentId).catch(
            endSend,
            );

        if (!response?.success) {
            alert("Could not initiate conversation with user.");
            endSend();
            return;
        }

        setConversationId(response.conversation?.id ?? "");
        userConversation = response.conversation;
        endSend();
        }

        setTimeout(async () => {
        if (!userConversation) return endSend();
        await EmployerConversationService.sendToUser(
            userConversation?.id,
            message,
        ).catch(endSend);
        endSend();
        });
    };

  if (loading || !isAuthenticated())
    return null;

  let lastSelf: boolean = false;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <DeleteModal>
          {jobToDelete && (
            <ListingsDeleteModal
              job={jobToDelete}
              deleteJob={delete_job}
              clearJob={clearSelectedJob}
              close={closeDeleteModal}
            />
          )}
        </DeleteModal>
        
        <ApplicantDeleteModal>
          {applicantToDelete && (
            <div className="p-8 pt-0 h-full">
              <div className="text-lg mb-4">
                Delete applicant "{getFullName(applicantToDelete.user)}"?
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelApplicantDelete}>Cancel</Button>
                <Button scheme="destructive" onClick={handleConfirmApplicantDelete}>Delete</Button>
              </div>
            </div>
          )}
        </ApplicantDeleteModal>

        <StatusChangeModal>
          {statusChangeData && (
            <div className="p-8 pt-0 h-full">
              <div className="text-lg mb-4">
                Change status for "{statusChangeData.applicants.length}" applicant{statusChangeData.applicants.length !== 1 ? "s" : ""}?
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelStatusChange}>Cancel</Button>
                <Button onClick={handleConfirmStatusChange}>Confirm</Button>
              </div>
            </div>
          )}
        </StatusChangeModal>

        <div className="flex-1 flex flex-col w-full">
          <div className="flex items-center">
            <button
              onClick={handleJobBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
            >
              <ArrowLeft className="s-8" />
            </button>
            <h3 className="leading-none tracking-tighter text-xl">{selectedJob?.title}</h3>
          </div>
          <div className="flex flex-col flex-1 gap-4">
            <div className={cn(
              "px-4 py-3 bg-white border-gray-200 border-2 rounded-md",
              isMobile
              ? "flex flex-col justify-between gap-4 px-2 py-4"
              : "grid grid-cols-2 grid-rows-2 gap-x-2 gap-y-1 w-fit" 
            )}>
              <div className="flex items-center gap-2">
                <div className={isMobile ? "pl-2": ""}>
                  <Toggle
                    state={selectedJob!.is_active}
                    onClick={handleToggleActive}
                  />
                </div>
                <span
                  className={cn(
                    "text-sm transition",
                    selectedJob!.is_active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {selectedJob!.is_active ? "Active" : "Paused"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={{
                  pathname:"/listings/details",
                  query: {
                    jobId: selectedJob!.id,
                  }
                }}
                >
                  <Button
                    key="edit"
                    variant="ghost"
                    disabled={saving}
                    className="hover:bg-primary/10 gap-1"
                  >
                    <Info size={16} />
                    Preview
                  </Button>
                </Link>
                <Link href={{
                  pathname:"/listings/edit",
                  query: {
                    jobId: selectedJob!.id,
                  }
                }}
                >
                  <Button
                    key="edit"
                    variant="ghost"
                    disabled={saving}
                    className="hover:bg-primary/10 gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                </Link>
                <Button
                  key="delete"
                  variant="ghost"
                  disabled={saving}
                  className="hover:bg-destructive/10 hover:text-destructive gap-1"
                  onClick={handleJobDelete}
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
              <p className={cn(
                "items-center col-span-2 text-gray-600 text-sm",
                isMobile
                ? "hidden"
                : "flex"
              )}>
                {selectedJob!.is_active 
                  ? "This listing is currently accepting applicants."
                  : "This listing is invisible and not currently accepting applicants."
                }
              </p>
            </div>
                {/* we need to add filtering here :D */}
                <ApplicationsContent
                  ref={applicationContentRef}
                  applications={filteredApplications}
                  statusId={[0, 1, 2, 3, 4, 5, 6]}
                  isLoading={isLoading}
                  openChatModal={openChatModal}
                  updateConversationId={updateConversationId}
                  onApplicationClick={handleApplicationClick}
                  onNotesClick={handleNotesClick}
                  onScheduleClick={handleScheduleClick}
                  onStatusChange={handleStatusChange}
                  setSelectedApplication={setSelectedApplication}
                  onRequestDeleteApplicant={handleRequestApplicantDelete}
                  onRequestStatusChange={handleRequestStatusChange}
                  applicantToDelete={applicantToDelete}
                  statusChangeInProgress={!!statusChangeData}
                ></ApplicationsContent>
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
            applicant={{
              ...selectedApplication?.user,
              internship_preferences: selectedApplication?.user?.internship_preferences as InternshipPreferences ?? undefined
              }}
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
          <div className="relative p-6 pb-20 h-full w-full">
            <div className="flex flex-col h-[100%] w-full">
              <div className="justify-between sticky top-0 z-10 py-2 border-b bg-white/90 backdrop-blur">
                <div className="flex items-center justify-between gap-2 font-medium text-lg">
                  {getFullName(selectedApplication?.user)}
                </div>
                  <div className="text-gray-500 text-sm max-w-[40vh] mb-2 flex truncate">
                    <p className="text-sm text-primary"> Applied for: </p>
                    {applications?.employer_applications.filter(a => a.user_id === selectedApplication?.user_id).map((a) => 
                      <p className="text-sm ml-1">
                        {a.job?.title}
                        {a !== applications?.employer_applications.filter(a => a.user_id === selectedApplication?.user_id).at(-1) &&
                          <>, </>
                        }
                      </p>
                      )
                    }
                  </div>
                  <button
                  className="flex items-center bg-primary text-white text-sm p-2 rounded-[0.33em] gap-2 hover:opacity-70"
                  onClick={onChatClick}
                  >
                    <SquareArrowOutUpRight className="h-5 w-5"/>
                    Go to Chat Page
                  </button>
              </div>     
              <div className="overflow-y-hidden flex-1 max-h-[75%] mb-6 pb-2 px-2 border-r border-l border-b">
                <div className="flex flex-col-reverse max-h-full min-h-full overflow-y-scroll p-0 gap-1">
                  <div ref={chatAnchorRef} />
                  {(conversation?.loading ?? true) ? (
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
                        <Card className="flex flex-col items-center justify-center p-4 px-6 border-transparent">
                          <MessageCirclePlus className="w-8 h-8 my-2 opacity-50" />
                          <div className="text-base font-bold">
                            No Messages Yet
                          </div>
                          <p className="text-gray-500 text-sm">Start a conversation to see your messages.</p>
                        </Card>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Textarea
                  ref={messageInputRef}
                  placeholder="Send a message here..."
                  className="w-full h-10 p-3 border-gray-200 rounded-[0.33em] focus:ring-0 focus:ring-transparent resize-none text-sm overflow-y-auto"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!selectedApplication?.user_id) return;
                      if (messageInputRef.current?.value) {
                        handleMessage(
                          selectedApplication.user_id,
                          messageInputRef.current.value,
                        );
                      }
                    }
                  }}
                  maxLength={1000}
                />
                <button 
                  disabled={sending || messageInputRef.current?.value.trim() === undefined}
                  onClick={() => {
                    if (!selectedApplication?.user_id) return;
                    if (messageInputRef.current?.value) {
                      handleMessage(
                        selectedApplication?.user_id,
                        messageInputRef.current?.value,
                      );
                    }
                  }}
                  className={cn("text-primary px-2",
                    (sending || messageInputRef.current?.value.trim() === undefined) ? "opacity-50" : ""
                  )}
                >
                    <SendHorizonal className="w-7 h-7" />
              </button>
              </div>
            </div>
          </div>
        </ChatModal>

        <NewChatModal>
          <div className="p-8">
            <div className="mb-4 flex flex-col items-center justify-center text-center">
              <MessageSquarePlus className="text-primary h-8 w-8 mb-4"/>
              <div className="flex flex-col items-center">
                <h3 className="text-lg">New Conversation</h3>
                <p className="text-gray-500 text-sm">
                  No conversation history with <span className="text-primary">{getFullName(selectedApplication?.user)}</span>.
                </p>
                <p className="text-gray-500 text-sm">Initiate new conversation?</p>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <Button 
                className="bg-white text-primary hover:bg-gray-100 border-solid border-2"
                onClick={closeNewChatModal}
                >
                  Cancel
                </Button>
                <Button 
                onClick={() => router.push(`/conversations?userId=${selectedApplication?.user_id}`)}
                >
                  Start chatting
                </Button>
              </div>
            </div>
          </div>
        </NewChatModal>

        <OldChatModal>
          <div className="p-8">
            <div className="mb-4 flex flex-col items-center justify-center text-center">
              <MessageSquareText className="text-primary h-8 w-8 mb-4"/>
              <div className="flex flex-col items-center">
                <h3 className="text-lg">Go to Conversations</h3>
                <p className="text-gray-500 text-sm">
                  You have existing chat history with <span className="text-primary">{getFullName(selectedApplication?.user)}</span>!
                </p>
                <p className="text-gray-500 text-sm">Redirect to conversations?</p>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <Button 
                className="bg-white text-primary hover:bg-gray-100 border-solid border-2"
                onClick={closeOldChatModal}
                >
                  Cancel
                </Button>
                <Button 
                onClick={() => router.push(`/conversations?userId=${selectedApplication?.user_id}`)}
                >
                  Go to chat
                </Button>
              </div>
            </div>
          </div>
        </OldChatModal>
      </motion.div>
    </>
  );
}
