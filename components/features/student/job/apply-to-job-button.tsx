import { useGlobalModal } from "@/components/providers/ModalProvider";
import { useJobsData } from "@/lib/api/student.data.api";
import { Job, PublicUser } from "@/lib/db/db.types";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuthContext } from "@/lib/ctx-auth";
import { useQueryClient } from "@tanstack/react-query";
import { IncompleteProfileContent } from "@/components/modals/IncompleteProfileModal";
import {
  isProfileBaseComplete,
  isProfileResume,
  isProfileVerified,
} from "@/lib/profile";
import { RefObject, useMemo } from "react";
import { ModalHandle } from "@/hooks/use-modal";

// ! todo: rmove openAppModal and use openGlobalModal instead
export const ApplyToJobButton = ({
  profile,
  job,
  openAppModal,
  applySuccessModalRef,
}: {
  profile: PublicUser | null;
  job: Job;
  openAppModal: () => void;
  applySuccessModalRef?: RefObject<ModalHandle | null>;
}) => {
  const auth = useAuthContext();
  const jobs = useJobsData();
  const queryClient = useQueryClient();
  const applied = useMemo(() => !!jobs.isJobApplied(job.id!), [jobs]);
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();

  /**
   * Opens the modal for completing incomplete profile
   *
   * @returns
   */
  const openIncompleteProfileModal = () =>
    openGlobalModal(
      "incomplete-profile",
      <IncompleteProfileContent
        job={job}
        applySuccessModalRef={applySuccessModalRef}
        onFinish={() => {
          closeGlobalModal("incomplete-profile");
          queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        }}
      />,
      {
        allowBackdropClick: false,
        onClose: () => {
          queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        },
      }
    );

  /**
   * Handles apply checks
   *
   * @returns
   */
  const handleApply = () => {
    if (!profile || !auth.isAuthenticated()) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      return;
    }

    if (
      !isProfileResume(profile) ||
      !isProfileBaseComplete(profile) ||
      profile.acknowledged_auto_apply === false
    ) {
      return openIncompleteProfileModal();
    }

    if (applied) {
      alert("You have already applied to this job!");
      return;
    }

    openAppModal();
  };

  return (
    <Button
      disabled={applied}
      scheme={applied ? "supportive" : "primary"}
      size={"md"}
      onClick={() => !applied && handleApply()}
    >
      {applied && <CheckCircle className="w-4 h-4" />}
      {applied ? "Applied" : "Apply Now"}
    </Button>
  );
};
