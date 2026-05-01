import { User } from "@/lib/db/db.types";
import { HeaderIcon } from "../ui/text";
import { FileUp } from "lucide-react";
import { FileUploadInput } from "@/hooks/use-file";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import ResumeUpload from "../features/student/resume-parser/ResumeUpload";
import { toast } from "sonner";

/**
 * The frontend of the modal for applying to a job.
 * @param applicant User applying to the job.
 * @param onCancel Function that runs when the user hits the cancel button.
 * @param onConfirm Function that runs when the user hits the confirm button.
 * @returns The frontend for the job application modal.
 */
export default function ApplicationActionModal({
  applicant,
  onCancel,
  onConfirm,
}: {
  applicant: User;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
}) {
  if (!applicant) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // this sets the processing state when the resume is confirmed.
  const handleConfirm = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      await onConfirm(file);
    } catch (e) {
      toast.error("Could not upload file. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full w-full">
      <div className="flex items-center gap-3 pt-4">
        <HeaderIcon icon={FileUp} />
        <h4>Upload your resume</h4>
      </div>

      <ResumeUpload
        ref={fileInputRef}
        isParsing={false}
        onSelect={(f) => setFile(f)}
        onComplete={() => {}}
      />

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
          scheme="primary"
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
