import { Resume } from "@/lib/db/db.types";
import { Pencil } from "lucide-react";
import { HeaderIcon } from "../ui/text";
import { Button } from "../ui/button";
import { FormInput } from "../EditForm";
import { useState } from "react";

interface RenameResumeProps {
  resume: Resume;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RenameResumeModal({
  resume,
  isProcessing,
  onConfirm,
  onCancel,
}: RenameResumeProps) {
  if (!resume) return null;

  const [label, setLabel] = useState(resume.label || "Default resume");

  return (
    <div className="flex flex-col gap-3 h-full w-full">
      <div className="flex items-center gap-3 pt-4">
        <HeaderIcon icon={Pencil} />
        <h4>Rename {resume.label}?</h4>
      </div>

      <FormInput label="Resume label" value={label} setter={setLabel} />

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
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? "Renaming resume..." : "Rename"}
        </Button>
      </div>
    </div>
  );
}
