"use client";

import { Button } from "@/components/ui/button";
import ResumeUpload from "@/components/features/student/resume-parser/ResumeUpload";
import { FormInput } from "@/components/EditForm";
import { UserService } from "@/lib/api/services";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";

type UploadStatus = "idle" | "ready" | "uploading" | "uploaded";

export function AddResumeModal({
  onCancel,
  onComplete,
  isAtResumeLimit,
}: {
  onCancel: () => void;
  onComplete: () => void;
  isAtResumeLimit: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeNameInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeLabel, setResumeLabel] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedFile) return;
    setResumeLabel(stripPdfExtension(selectedFile.name));
    setUploadStatus("ready");
    const focusTimer = window.setTimeout(() => {
      resumeNameInputRef.current?.focus();
      resumeNameInputRef.current?.select();
    }, 180);
    return () => window.clearTimeout(focusTimer);
  }, [selectedFile]);

  const canUpload = !!selectedFile && !!resumeLabel.trim() && !isAtResumeLimit;

  async function handleUpload() {
    if (!canUpload || !selectedFile) return;

    try {
      setSaving(true);
      const form = new FormData();
      const label = resumeLabel.trim() || selectedFile.name;
      const uploadFilename = /\.pdf$/i.test(label) ? label : `${label}.pdf`;
      form.append("resume", selectedFile, uploadFilename);
      form.append("label", label);

      setUploadStatus("uploading");
      const response = (await UserService.updateMyResume(form)) as {
        success?: boolean;
      };

      const ok = response.success !== false;

      if (ok) {
        setUploadStatus("uploaded");
        toast.success("Resume uploaded successfully.", toastPresets.success);
        onComplete();
      } else {
        setUploadStatus("ready");
        toast.error("Could not upload your resume. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("ready");
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
          <ResumeUpload
            ref={fileInputRef}
            isParsing={false}
            onSelect={(file) => {
              setSelectedFile(file);
              setUploadStatus("ready");
            }}
            onComplete={() => {}}
          />

          <AnimatePresence>
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-3 overflow-visible px-0.5 pb-0.5"
              >
                <FormInput
                  ref={resumeNameInputRef}
                  label="Resume label"
                  value={resumeLabel}
                  setter={(value) => {
                    setResumeLabel(value);
                    setUploadStatus("ready");
                  }}
                  className="focus-visible:border-primary focus-visible:ring-primary/70 focus-visible:text-primary focus-visible:ring-2"
                  placeholder="Name this resume (e.g., Software Engineering Resume)"
                />
                <UploadProgress status={uploadStatus} />
              </motion.div>
            )}
          </AnimatePresence>
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

function UploadProgress({ status }: { status: UploadStatus }) {
  if (status === "idle") return null;

  const progress = status === "ready" ? 35 : status === "uploading" ? 72 : 100;
  const label =
    status === "ready"
      ? "Ready to upload"
      : status === "uploading"
        ? "Uploading resume..."
        : "Resume uploaded";

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function stripPdfExtension(name: string) {
  return name.replace(/\.pdf$/i, "");
}
