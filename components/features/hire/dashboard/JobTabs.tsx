"use client";

import { useAuthContext } from "@/app/hire/authctx";
import { ApplicationsContent } from "@/components/features/hire/dashboard/ApplicationsContent";
import { useEmployerApplications } from "@/hooks/use-employer-api";
import { useFile } from "@/hooks/use-file";
import { UserService } from "@/lib/api/services";
import { EmployerApplication } from "@/lib/db/db.types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Job } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

  const router = useRouter();

  const { triggerAction } = useApplicationActions(applications.review, () => {
    applicationContentRef.current?.unselectAll();
  });

  const applicationContentRef = useRef<{ unselectAll: () => void }>(null);

  // Fetch a presigned resume URL for the currently selected user
  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: useCallback(
      async () =>
        await UserService.getUserResumeURL(
          selectedApplication?.user_id ?? "",
          selectedApplication?.resume_id ?? "",
        ),
      [selectedApplication?.user_id, selectedApplication?.resume_id],
    ),
    route: selectedApplication
      ? `/users/${selectedApplication.user_id}/resume/${selectedApplication.resume_id}`
      : "",
  });

  // Refresh presigned URL whenever the selected applicant changes
  useEffect(() => {
    if (selectedApplication?.user_id) {
      syncResumeURL();
    }
  }, [selectedApplication?.user_id, syncResumeURL]);

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
    router.push(`/dashboard/applicant?applicationId=${application.id}`);
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
              setSelectedApplication={setSelectedApplication}
              onAction={triggerAction}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
