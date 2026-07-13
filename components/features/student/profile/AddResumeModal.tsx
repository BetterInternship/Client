"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import {
  ResumeUploadFormFields,
  useResumeUploadForm,
} from "@/components/features/student/resume-parser/ResumeUploadForm";

export function AddResumeModal({
  onCancel,
  onComplete,
  isAtResumeLimit,
}: {
  onCancel: () => void;
  onComplete: () => void;
  isAtResumeLimit: boolean;
}) {
  const resumeUpload = useResumeUploadForm();
  const [saving, setSaving] = useState(false);

  const canUpload = resumeUpload.canUpload && !isAtResumeLimit;

  async function handleUpload() {
    if (!canUpload) return;

    try {
      setSaving(true);
      const response = await resumeUpload.uploadResume();
      const ok = response?.success === true;

      if (ok) {
        toast.success("Resume uploaded successfully.", toastPresets.success);
        onComplete();
      } else {
        toast.error("Could not upload your resume. Please try again.");
      }
    } catch (error) {
      console.error(error);
      resumeUpload.resetUploadState();
      toast.error("Could not upload your resume. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 pt-2 sm:w-[34rem]">
      <div className="space-y-4">
        <ResumeUploadFormFields
          form={resumeUpload}
          inputClassName="focus-visible:border-primary focus-visible:ring-primary/70 focus-visible:text-primary focus-visible:ring-2"
          placeholder="Name this resume (e.g., Software Engineering Resume)"
        />
      </div>

      <div className="mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          disabled={!canUpload || saving}
          onClick={() => void handleUpload()}
          className="w-full sm:w-auto"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Upload Resume
        </Button>
      </div>
    </div>
  );
}
