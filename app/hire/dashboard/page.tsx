// Main dashboard page - uses clean architecture with focused hooks and context
// Wraps everything in DashboardProvider for shared state management
"use client";

import { useAuthContext } from "../authctx";
import ContentLayout from "@/components/features/hire/content-layout";
import { ApplicationsTable } from "@/components/features/hire/dashboard/ApplicationsTable";
import { ShowUnverifiedBanner } from "@/components/ui/banner";
import { useSideModal } from "@/hooks/use-side-modal";
import { useCallback, useRef, useState } from "react";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useEmployerApplications, useProfile } from "@/hooks/use-employer-api";
import { Button } from "@/components/ui/button";
import { EmployerApplication } from "@/lib/db/db.types";
import { FileText, SendHorizonal } from "lucide-react";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { useModal } from "@/hooks/use-modal";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { ReviewModalContent } from "@/components/features/hire/dashboard/ReviewModalContent";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { getFullName } from "@/lib/utils/user-utils";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/components/ui/messages";
import { useFile } from "@/hooks/use-file";

function DashboardContent() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const profile = useProfile();
  const applications = useEmployerApplications();
  const [selectedApplication, setSelectedApplication] =
    useState<EmployerApplication | null>(null);
  const [conversationId, setConversationId] = useState("");
  const conversations = useConversations("employer");
  const updateConversationId = (userId: string) => {
    let userConversation = conversations.data?.find((c) =>
      c?.subscribers?.includes(userId)
    );
    setConversationId(userConversation?.id);
  };
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatAnchorRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const conversation = useConversation("employer", conversationId);
  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: useCallback(
      async () =>
        await UserService.getUserResumeURL(selectedApplication?.user_id ?? ""),
      [selectedApplication]
    ),
    route: selectedApplication
      ? `/users/${selectedApplication.user_id}/resume`
      : "",
  });

  const endSend = () => {
    setSending(false);
    setTimeout(() => {
      chatAnchorRef.current?.scrollIntoView({ behavior: "instant" });
      messageInputRef.current?.focus();
    }, 100);
  };

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
    }

    if (!userConversation) return endSend();
    await EmployerConversationService.sendToUser(
      userConversation?.id,
      message
    ).catch(endSend);
    endSend();
  };

  const {
    open: openChatModal,
    close: closeChatModal,
    SideModal: ChatModal,
  } = useSideModal("chat-modal", {
    onClose: () => conversation.unsubscribe(),
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

  redirectIfNotLoggedIn();

  const handleApplicationClick = (application: EmployerApplication) => {
    openApplicantModal();
    setSelectedApplication(application);
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

  // ! remove, find a better way
  let lastSelf = false;

  return (
    <ContentLayout>
      <div className="flex-1 flex flex-col w-full">
        <div className="p-6 flex flex-col h-0 flex-1 space-y-6">
          {!profile.loading && !profile.data?.is_verified ? (
            <ShowUnverifiedBanner />
          ) : (
            <ApplicationsTable
              applications={applications.employer_applications}
              openChatModal={openChatModal}
              updateConversationId={updateConversationId}
              onApplicationClick={handleApplicationClick}
              onNotesClick={handleNotesClick}
              onScheduleClick={handleScheduleClick}
              onStatusChange={handleStatusChange}
              setSelectedApplication={setSelectedApplication}
            />
          )}
        </div>
      </div>

      <ApplicantModal>
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
              <div className="flex flex-col-reverse max-h-full overflow-y-scroll p-2 gap-1">
                <div ref={chatAnchorRef} />
                {conversation.messages
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
                  ))}
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
