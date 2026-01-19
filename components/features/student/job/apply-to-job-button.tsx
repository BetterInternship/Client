import { useJobsData } from "@/lib/api/student.data.api";
import { Job, PublicUser } from "@/lib/db/db.types";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuthContext } from "@/lib/ctx-auth";
import { isProfileBaseComplete, isProfileResume } from "@/lib/profile";
import { useMemo } from "react";
import useModalRegistry from "@/components/modals/modal-registry";
import { useRouter } from "next/navigation";

// ! todo: rmove openAppModal and use openGlobalModal instead
export const ApplyToJobButton = ({
  profile,
  job,
  openAppModal,
  className,
}: {
  profile: PublicUser | null;
  job: Job;
  openAppModal: () => void;
  className?: string;
}) => {
  const auth = useAuthContext();
  const jobs = useJobsData();
  const modalRegistry = useModalRegistry();
  const applied = useMemo(() => !!jobs.isJobApplied(job.id!), [jobs]);
  const router = useRouter();

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
      return modalRegistry.incompleteProfile.open();
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
      className={className}
    >
      {applied && <CheckCircle className="w-4 h-4" />}
      {applied ? "Applied" : "Apply Now"}
    </Button>
  );
};
