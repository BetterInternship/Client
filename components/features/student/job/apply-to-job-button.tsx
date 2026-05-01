import { useJobsData } from "@/lib/api/student.data.api";
import { Job, PublicUser } from "@/lib/db/db.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { useAuthContext } from "@/lib/ctx-auth";
import { useMemo } from "react";
import { toast } from "sonner";
import useModalRegistry from "@/components/modals/modal-registry";

export const ApplyToJobButton = ({
  profile,
  job,
  onApply,
  className,
}: {
  profile: PublicUser | null;
  job: Job;
  onApply: () => void | Promise<void>;
  className?: string;
}) => {
  const auth = useAuthContext();
  const modalRegistry = useModalRegistry();
  const jobs = useJobsData();
  const applied = useMemo(() => !!jobs.isJobApplied(job.id!), [jobs]);
  const isSuperListing = Boolean(job.challenge);

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

    if (applied) {
      toast.error("You have already applied to this job!");
      return;
    }

    modalRegistry.completeProfileApply.open({
      profile,
      onApply,
    });
  };

  return (
    <Button
      disabled={applied}
      scheme={applied ? "supportive" : "primary"}
      size={"md"}
      onClick={() => !applied && handleApply()}
      className={cn(
        className,
        isSuperListing &&
          !applied &&
          "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-amber-400/50 shadow-[0_4px_14px_rgba(245,158,11,0.3)] font-bold",
      )}
    >
      {applied && <CheckCircle className="w-4 h-4" />}
      {applied ? "Applied" : "Apply"}
    </Button>
  );
};
