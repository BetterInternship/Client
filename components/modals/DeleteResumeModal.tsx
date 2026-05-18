import { Resume } from "@/lib/db/db.types";
import { Button } from "../ui/button";

interface DeleteResumeProps {
  resume: Resume;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteResumeModal({
  resume,
  isProcessing,
  onConfirm,
  onCancel,
}: DeleteResumeProps) {
  if (!resume) return null;

  return (
    <div className="flex h-full w-full flex-col gap-6 pt-2 sm:w-[34rem]">
      <p className="text-sm ">This action is permanent and cannot be undone.</p>

      {/* action buttons */}
      <div className="mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
          {isProcessing ? "Deleting resume..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
