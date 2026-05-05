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
      const ok = !!response && response.success !== false;

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
    <div className="w-full sm:w-[34rem] p-4 sm:p-0 px-8">
      <div className="space-y-5 px-8 p-4">
        <div className="relative pr-10">
          <h3 className="mt-1 text-xl font-semibold text-gray-900">
            Upload new resume
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PDF resume to make it available when applying.
          </p>
        </div>

        <div className="space-y-4">
          <ResumeUploadFormFields
            form={resumeUpload}
            inputClassName="focus-visible:border-primary focus-visible:ring-primary/70 focus-visible:text-primary focus-visible:ring-2"
            placeholder="Name this resume (e.g., Software Engineering Resume)"
          />
        </div>

        <div className="flex items-center border-t pt-4 mt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Cancel
          </Button>
          <div className="ml-auto flex justify-end gap-2">
            <Button
              disabled={!canUpload || saving}
              onClick={() => void handleUpload()}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Upload Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
