"use client";

import { useAuthContext } from "@/app/hire/authctx";
import { ApplicationsContent } from "@/components/features/hire/dashboard/ApplicationsContent";
import { Card } from "@/components/ui/card";
import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useEmployerApplications, useProfile } from "@/hooks/use-employer-api";
import { useFile } from "@/hooks/use-file";
import { useModal } from "@/hooks/use-modal";
import { useSideModal } from "@/hooks/use-side-modal";
import { EmployerConversationService, UserService } from "@/lib/api/services";
import { EmployerApplication, InternshipPreferences } from "@/lib/db/db.types";
import {
  Archive,
  Check,
  List,
  MessageSquarePlus,
  MessageSquareText,
  Trash2,
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
import useApplicationActions from "@/hooks/use-application-actions";

interface JobTabsProps {
  selectedJob: Job | null;
}

export default function JobTabs({ selectedJob }: JobTabsProps) {
  // Business logic hook
  const { isAuthenticated, redirectIfNotLoggedIn } = useAuthContext();
  const applications = useEmployerApplications();
  const [isLoading, setLoading] = useState(true);
  const [exitingBack, setExitingBack] = useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState<EmployerApplication | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [lastSending, setLastSending] = useState(false);
  const [sending, setSending] = useState(false);

  const router = useRouter();

  const {
    triggerArchive,
    triggerDelete,
    triggerAccept,
    triggerReject,
    triggerShortlist,
    triggerMassStatusChange,
  } = useApplicationActions(applications.review, () => {
    applicationContentRef.current?.unselectAll();
  });

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

  //gets applications for the specific job id
  const filteredApplications = selectedJobId
    ? applications.employer_applications.filter(
        (application) => application.job_id === selectedJobId,
      )
    : applications.employer_applications;
  const isSuperListing = Boolean(selectedJob?.challenge);

  redirectIfNotLoggedIn();

  const handleApplicationClick = (application: EmployerApplication) => {
    setSelectedApplication(application); // set first
    router.push(
      `/dashboard/applicant?userId=${application?.user_id}&jobId=${selectedJobId}`,
    );
  };
  const handleStatusChange = (
    application: EmployerApplication,
    status: number,
  ) => {
    applications.review(application.id ?? "", { status });
  };

  if (isLoading || !isAuthenticated()) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={exitingBack ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex-1 flex flex-col w-full">
          <div className="flex flex-col flex-1 gap-4">
            {/* we need to add filtering here :D */}
            <ApplicationsContent
              ref={applicationContentRef}
              applications={filteredApplications}
              isSuperListing={isSuperListing}
              isLoading={isLoading}
              onApplicationClick={handleApplicationClick}
              onStatusChange={handleStatusChange}
              setSelectedApplication={setSelectedApplication}
              onRequestArchiveApplicant={triggerArchive}
              onRequestDeleteApplicant={triggerDelete}
              onRequestAcceptApplicant={triggerAccept}
              onRequestRejectApplicant={triggerReject}
              onRequestShortlistApplicant={triggerShortlist}
              onRequestStatusChange={triggerMassStatusChange}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
