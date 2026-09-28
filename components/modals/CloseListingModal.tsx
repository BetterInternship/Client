import { Ban } from "lucide-react";
import { HeaderIcon } from "../ui/text";
import { Button } from "@betterinternship/components";

interface CloseListingModalProps {
  jobTitle: string;
  pendingCount: number;
  shortlistedCount: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onReviewFirst: () => void;
  onCancel: () => void;
}

/**
 * Warns before closing a listing leaves its pending applicants without a
 * decision — not a gate, just a notice: closing proceeds either way, but the
 * employer can detour into the Pending tab first
 * (Docs/plans/APPLICANT_STATUS_FINALIZATION_PLAN.md §4.3, D3/D11).
 */
export default function CloseListingModal({
  jobTitle,
  pendingCount,
  shortlistedCount,
  isProcessing,
  onConfirm,
  onReviewFirst,
  onCancel,
}: CloseListingModalProps) {
  return (
    <div className="flex flex-col gap-3 h-full w-full">
      <div className="flex items-center gap-3 pt-4">
        <HeaderIcon icon={Ban} />
        <h4>Close {jobTitle}?</h4>
      </div>
      <span>
        {pendingCount} applicant{pendingCount === 1 ? "" : "s"} haven&apos;t
        heard back from you. They&apos;ll be told this listing has closed.
      </span>
      {shortlistedCount > 0 && (
        <span className="text-sm text-gray-500">
          {shortlistedCount} shortlisted applicant
          {shortlistedCount === 1 ? "" : "s"} won&apos;t be notified — accept or
          reject them if you&apos;re done with them.
        </span>
      )}

      {/* action buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-auto pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={onReviewFirst}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          Review them first
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? "Closing..." : "Close listing"}
        </Button>
      </div>
    </div>
  );
}
