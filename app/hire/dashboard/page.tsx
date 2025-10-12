// Main dashboard page - uses clean architecture with focused hooks and context
// Wraps everything in DashboardProvider for shared state management
"use client";

import { useAuthContext } from "../authctx";
import ContentLayout from "@/components/features/hire/content-layout";
import { ApplicationsTable } from "@/components/features/hire/dashboard/ApplicationsTable";
import { ShowUnverifiedBanner } from "@/components/ui/banner";
import { useSideModal } from "@/hooks/use-side-modal";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useEmployerApplications, useProfile } from "@/hooks/use-employer-api";
import { EmployerApplication } from "@/lib/db/db.types";
import { FileText, MessageCircle, SendHorizonal } from "lucide-react";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { useModal } from "@/hooks/use-modal";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { ReviewModalContent } from "@/components/features/hire/dashboard/ReviewModalContent";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { getFullName } from "@/lib/profile";
import { useFile } from "@/hooks/use-file";
import { Loader } from "@/components/ui/loader";

function DashboardContent() {
  const { isAuthenticated, redirectIfNotLoggedIn, loading } = useAuthContext();
  const profile = useProfile();
  const applications = useEmployerApplications();

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
    </ContentLayout>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
