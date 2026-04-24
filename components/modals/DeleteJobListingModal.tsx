import { Job } from "@/lib/db/db.types";
import { Trash2 } from "lucide-react";
import { HeaderIcon } from "../ui/text";
import { Button } from "../ui/button";

interface DeleteJobListingProps {
  job: Job;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteJobListingModal({
  job,
  isProcessing,
  onConfirm,
  onCancel,
}: DeleteJobListingProps) {
  if (!job) return null;

  return (
    <div className="flex flex-col gap-3 h-full w-full">
      <div className="flex items-center gap-3 pt-4">
        <HeaderIcon icon={Trash2} />
        <h4>Delete {job.title}?</h4>
      </div>
      <span>This action is permanent and cannot be undone.</span>

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
