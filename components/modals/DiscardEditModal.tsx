import { Button } from "@betterinternship/components";

interface DiscardEditModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  confirmLabel?: string;
}

export default function DiscardEditModal({
  onConfirm,
  onCancel,
  message = "All unsaved changes will be lost.",
  confirmLabel = "Discard edits",
}: DiscardEditModalProps) {
  return (
    <div className="flex flex-col gap-5 h-full w-full">
      <span>{message}</span>

      {/* action buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-auto pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Continue editing
        </Button>
        <Button onClick={onConfirm} className="w-full sm:w-auto">
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
