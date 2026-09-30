import { Job } from "@/lib/db/db.types";
import { Button } from "@betterinternship/components";

interface DeleteJobListingProps {
  job: Job;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /**
   * Pending, visible applicants who'd be told this listing closed — 0 when
   * the listing is already inactive, since deleting it then is not a
   * transition and notifies no one
   * (Docs/plans/APPLICANT_STATUS_FINALIZATION_PLAN.md D10/§4.3).
   */
  pendingApplicantCount?: number;
}

export default function DeleteJobListingModal({
  job,
  isProcessing,
  onConfirm,
  onCancel,
  pendingApplicantCount = 0,
}: DeleteJobListingProps) {
  if (!job) return null;

  return (
    <div className="flex flex-col gap-5 h-full w-full">
      <span>
        {pendingApplicantCount > 0
          ? `This is permanent. ${pendingApplicantCount} applicant${pendingApplicantCount === 1 ? "" : "s"} will be told this listing has closed, and you won't be able to accept or reject anyone afterwards.`
          : "This action is permanent and cannot be undone."}
      </span>

      {/* action buttons */}
      <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          scheme="destructive"
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? "Deleting job..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
