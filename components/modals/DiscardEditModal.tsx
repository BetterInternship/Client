import { TriangleAlert } from "lucide-react";
import { HeaderIcon } from "../ui/text";
import { Button } from "@betterinternship/components";

interface DiscardEditModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

export default function DiscardEditModal({
  onConfirm,
  onCancel,
  title = "Discard your changes?",
  message = "All unsaved changes will be lost.",
  confirmLabel = "Discard edits",
}: DiscardEditModalProps) {
  return (
    <div className="flex flex-col gap-3 h-full w-full">
      <div className="flex items-center gap-3 pt-4">
        <HeaderIcon icon={TriangleAlert} />
        <h4>{title}</h4>
      </div>
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
