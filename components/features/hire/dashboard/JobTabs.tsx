"use client";

import { useAuthContext } from "@/app/hire/authctx";
import { ApplicationsContent } from "@/components/features/hire/dashboard/ApplicationsContent";
import { Card } from "@/components/ui/card";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import {
  useEmployerApplications,
  useProfile,
} from "@/hooks/use-employer-api";
import { useFile } from "@/hooks/use-file";
import { useModal } from "@/hooks/use-modal";
import { useSideModal } from "@/hooks/use-side-modal";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { EmployerApplication, InternshipPreferences } from "@/lib/db/db.types";
import {
  MessageSquarePlus,
  MessageSquareText,
} from "lucide-react";
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
import {
  FileText,
  MessageCirclePlus,
  SendHorizonal,
  SquareArrowOutUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JobTabsProps {
  selectedJob: Job | null;
  onJobUpdate?: (updates: Partial<Job>) => void;
}

export default function JobTabs({ selectedJob, onJobUpdate }: JobTabsProps) {
  // Business logic hook
  const { isAuthenticated, redirectIfNotLoggedIn, loading } = useAuthContext();
  const profile = useProfile();
  const applications = useEmployerApplications();
  const [isLoading, setLoading] = useState(true);
  const [exitingBack, setExitingBack] = useState(false);

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
  const [applicantToArchive, setApplicantToArchive] =
    useState<EmployerApplication | null>(null);
  const [applicantToDelete, setApplicantToDelete] =
    useState<EmployerApplication | null>(null);
  const [statusChangeData, setStatusChangeData] = useState<{
    applicants: EmployerApplication[];
    status: number;
  } | null>(null);

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatAnchorRef = useRef<HTMLDivElement>(null);
  const [lastSending, setLastSending] = useState(false);
  const [sending, setSending] = useState(false);
  const conversation = useConversation("employer", conversationId);

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
      setLoading(true);

      const timer = setTimeout(() => {
        setLoading(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [selectedJob?.id]);

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
    onClose: () => (conversation.unsubscribe(), setConversationId("")),
  });

  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.key === "Escape") {
        closeChatModal();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
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
    open: openApplicantArchiveModal,
    close: closeApplicantArchiveModal,
    Modal: ApplicantArchiveModal,
  } = useModal("applicant-archive-modal");

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
    router.push(
      `/dashboard/applicant?userId=${application?.user_id}&jobId=${selectedJobId}`,
    );
  };

  const handleNotesClick = (application: EmployerApplication) => {
    openReviewModal();
    setSelectedApplication(application);
  };

  const handleScheduleClick = (application: EmployerApplication) => {
    setSelectedApplication(application);
    window?.open(application.user?.calendar_link ?? "", "_blank");
  };

  const handleStatusChange = (
    application: EmployerApplication,
    status: number,
  ) => {
    applications.review(application.id ?? "", { status });
  };

  const handleRequestApplicantArchive = (application: EmployerApplication) => {
    setApplicantToArchive(application);
    openApplicantArchiveModal();
  };

  const handleRequestApplicantDelete = (application: EmployerApplication) => {
    setApplicantToDelete(application);
    openApplicantDeleteModal();
  };

  const handleConfirmApplicantArchive = async () => {
    if (!applicantToArchive?.id) return;
    await applications.review(applicantToArchive.id, { status: 7 });
    setApplicantToArchive(null);
    closeApplicantArchiveModal();
    applicationContentRef.current?.unselectAll();
  };

  const handleConfirmApplicantDelete = async () => {
    if (!applicantToDelete?.id) return;
    await applications.review(applicantToDelete.id, { status: 5 });
    setApplicantToDelete(null);
    closeApplicantDeleteModal();
    applicationContentRef.current?.unselectAll();
  };

  const handleCancelApplicantArchive = () => {
    setApplicantToArchive(null);
    closeApplicantArchiveModal();
  };

  const handleCancelApplicantDelete = () => {
    setApplicantToDelete(null);
    closeApplicantDeleteModal();
  };

  const onChatClick = async () => {
    if (!selectedApplication?.user_id) return;

    const userConversation = conversations.data?.find((c) =>
      c?.subscribers?.includes(selectedApplication?.user_id),
    );

    if (userConversation) {
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
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeData) return;

    await Promise.all(
      statusChangeData.applicants.map((app) =>
        applications.review(app.id ?? "", { status: statusChangeData.status }),
      ),
    );

    setStatusChangeData(null);
    closeStatusChangeModal();
    applicationContentRef.current?.unselectAll();
  };

  // Handle message
  const handleMessage = async (
    studentId: string | undefined,
    message: string,
  ) => {
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

  if (isLoading || !isAuthenticated()) return null;

  let lastSelf: boolean = false;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={exitingBack ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <ApplicantArchiveModal>
          {applicantToArchive && (
            <div className="p-8 pt-0 h-full">
              <div className="text-lg mb-4">
                Archive applicant "{getFullName(applicantToArchive.user)}"?
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelApplicantArchive}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirmApplicantArchive}
                >
                  Archive
                </Button>
              </div>
            </div>
          )}
        </ApplicantArchiveModal>

        <ApplicantDeleteModal>
          {applicantToDelete && (
            <div className="p-8 pt-0 h-full">
              <div className="flex flex-col gap-2 mb-4">
                <span className="text-lg">
                  Delete applicant "{getFullName(applicantToDelete.user)}"?
                </span>
                <span>This action is permanent and cannot be reversed.</span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelApplicantDelete}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  scheme="destructive"
                  onClick={handleConfirmApplicantDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </ApplicantDeleteModal>

        <StatusChangeModal>
          {statusChangeData && (
            <div className="p-8 pt-0 h-full">
              <div className="text-lg mb-4">
                <span>
                  Change status for {statusChangeData.applicants.length}{" "}
                  applicant{statusChangeData.applicants.length !== 1 ? "s" : ""}
                  ?
                </span>
                <ul className="list-disc list-inside text-sm">
                  {statusChangeData.applicants.map((a) => (
                    <li>
                      {a.user?.first_name} {a.user?.last_name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelStatusChange}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmStatusChange}>Confirm</Button>
              </div>
            </div>
          )}
        </StatusChangeModal>

        <div className="flex-1 flex flex-col w-full">
          <div className="flex flex-col flex-1 gap-4">
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
              onRequestArchiveApplicant={handleRequestApplicantArchive}
              onRequestDeleteApplicant={handleRequestApplicantDelete}
              onRequestStatusChange={handleRequestStatusChange}
              applicantToArchive={applicantToArchive}
              applicantToDelete={applicantToDelete}
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
              internship_preferences:
                (selectedApplication?.user
                  ?.internship_preferences as InternshipPreferences) ??
                undefined,
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
                  {applications?.employer_applications
                    .filter((a) => a.user_id === selectedApplication?.user_id)
                    .map((a) => (
                      <p className="text-sm ml-1">
                        {a.job?.title}
                        {a !==
                          applications?.employer_applications
                            .filter(
                              (a) => a.user_id === selectedApplication?.user_id,
                            )
                            .at(-1) && <>, </>}
                      </p>
                    ))}
                </div>
                <button
                  className="flex items-center bg-primary text-white text-sm p-2 rounded-[0.33em] gap-2 hover:opacity-70"
                  onClick={onChatClick}
                >
                  <SquareArrowOutUpRight className="h-5 w-5" />
                  Go to Chat Page
                </button>
              </div>
              <div className="overflow-y-hidden flex-1 max-h-[75%] mb-6 pb-2 px-2 border-r border-l border-b">
                <div className="flex flex-col-reverse max-h-full min-h-full overflow-y-scroll p-0 gap-1">
                  <div ref={chatAnchorRef} />
                  {(conversation?.loading ?? true) ? (
                    <div className="w-full h-full mb-[50%] flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading Conversation...</p>
                      </div>
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
                        <Card className="flex flex-col p-4 px-6 border-transparent">
                          <MessageCirclePlus className="w-8 h-8 my-2 opacity-50" />
                          <div className="text-base font-bold">
                            No Messages Yet
                          </div>
                          <p className="text-gray-500 text-sm">
                            Start a conversation to see your messages.
                          </p>
                        </Card>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    !selectedApplication?.user_id ||
                    !messageInputRef.current?.value?.trim() ||
                    sending
                  )
                    return;

                  const message = messageInputRef.current.value;
                  messageInputRef.current.value = "";
                  handleMessage(selectedApplication.user_id, message);
                }}
              >
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
                  disabled={sending}
                  onClick={() => {
                    if (!selectedApplication?.user_id) return;
                    if (messageInputRef.current?.value) {
                      handleMessage(
                        selectedApplication?.user_id,
                        messageInputRef.current?.value,
                      );
                    }
                  }}
                  className={cn(
                    "text-primary px-2",
                    sending ? "opacity-50" : "hover:opacity-70",
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
              <MessageSquarePlus className="text-primary h-8 w-8 mb-4" />
              <div className="flex flex-col items-center">
                <h3 className="text-lg">New Conversation</h3>
                <p className="text-gray-500 text-sm">
                  No conversation history with{" "}
                  <span className="text-primary">
                    {getFullName(selectedApplication?.user)}
                  </span>
                  .
                </p>
                <p className="text-gray-500 text-sm">
                  Initiate new conversation?
                </p>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <Button
                  className="bg-white text-primary hover:bg-gray-100 border-solid border-2"
                  onClick={closeNewChatModal}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedApplication?.user_id) return;
                    const response =
                      await EmployerConversationService.createConversation(
                        selectedApplication.user_id,
                      );
                    if (response?.success && response.conversation?.id)
                      router.push(
                        `/conversations?conversationId=${response.conversation.id}`,
                      );
                  }}
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
              <MessageSquareText className="text-primary h-8 w-8 mb-4" />
              <div className="flex flex-col items-center">
                <h3 className="text-lg">Go to Conversations</h3>
                <p className="text-gray-500 text-sm">
                  You have existing chat history with{" "}
                  <span className="text-primary">
                    {getFullName(selectedApplication?.user)}
                  </span>
                  !
                </p>
                <p className="text-gray-500 text-sm">
                  Redirect to conversations?
                </p>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <Button
                  className="bg-white text-primary hover:bg-gray-100 border-solid border-2"
                  onClick={closeOldChatModal}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    const findChat = conversations.data.find((convo) =>
                      convo.subscribers?.includes(selectedApplication?.user_id),
                    );
                    if (findChat)
                      router.push(
                        `/conversations?conversationId=${findChat.id}`,
                      );
                  }}
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
