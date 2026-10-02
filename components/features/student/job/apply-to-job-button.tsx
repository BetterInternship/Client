import { useJobStatus } from "@/lib/api/student.data.api";
import { Job, PublicUser } from "@/lib/db/db.types";
import { Button } from "@betterinternship/components";
import { cn } from "@betterinternship/components";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useAuthContext } from "@/lib/ctx-auth";
import { useMemo } from "react";
import { toast } from "sonner";
import useModalRegistry from "@/components/modals/modal-registry";
import { isProfileEligibleForListing } from "@/lib/profile";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";
import { ListingAlertButton } from "./listing-alert-button";
import { savePostLoginRedirect } from "@/lib/post-login-redirect";

export const ApplyToJobButton = ({
  profile,
  job,
  onApply,
  className,
  disabled,
  presentation,
}: {
  profile: PublicUser | null;
  job: Job;
  onApply: (payload: ApplyPayload) => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  presentation?: "curated";
}) => {
  const auth = useAuthContext();
  const modalRegistry = useModalRegistry();
  const jobs = useJobStatus();
  const applied = useMemo(() => !!jobs.isJobApplied(job.id!), [jobs]);
  const isSuperListing = Boolean(job.challenge);

  // A hibernating listing can't be applied to — the CTA becomes a job alert
  // toggle instead, everywhere ApplyToJobButton is rendered.
  if (job.hibernating) {
    return (
      <ListingAlertButton job={job} className={className} disabled={disabled} />
    );
  }

  /**
   * Handles apply checks
   *
   * @returns
   */
  const handleApply = () => {
    if (!profile || !auth.isAuthenticated()) {
      savePostLoginRedirect(
        `${window.location.pathname}${window.location.search}`,
      );
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      return;
    }

    if (applied) {
      toast.error("You have already applied to this job!");
      return;
    }

    // Check if the profile meets the listing's requirements
    const { eligible, missing } = isProfileEligibleForListing(profile, job);
    if (!eligible) {
      modalRegistry.missingRequirements.open({ missing });
      return;
    }

    modalRegistry.completeProfileApply.open({
      profile,
      onApply,
    });
  };

  return (
    <Button
      disabled={disabled || applied}
      scheme={applied ? "supportive" : "primary"}
      size={"md"}
      onClick={() => !disabled && !applied && handleApply()}
      className={cn(
        className,
        isSuperListing &&
          presentation !== "curated" &&
          !applied &&
          "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-amber-400/50 shadow-[0_4px_14px_rgba(245,158,11,0.3)] font-bold",
      )}
    >
      {applied && <CheckCircle className="w-4 h-4" />}
      {applied ? "Applied" : "Apply"}
      {presentation === "curated" && !applied && (
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
};
