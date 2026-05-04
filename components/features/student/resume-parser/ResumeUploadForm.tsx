"use client";

import { FormInput } from "@/components/EditForm";
import { UserService } from "@/lib/api/services";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import ResumeUpload from "./ResumeUpload";

export type ResumeUploadStatus = "idle" | "uploading" | "uploaded";

type UploadResumeResponse = {
  success?: boolean;
  resume?: { id?: string };
};

export function useResumeUploadForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeNameInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeLabel, setResumeLabel] = useState("");
  const [uploadStatus, setUploadStatus] = useState<ResumeUploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetUploadState = useCallback(() => {
    setUploadStatus("idle");
    setUploadProgress(0);
  }, []);

  const selectFile = useCallback((file: File) => {
    setSelectedFile(file);
    setResumeLabel(stripPdfExtension(file.name));
    setUploadStatus("idle");
    setUploadProgress(0);
  }, []);

  const updateLabel = useCallback((label: string) => {
    setResumeLabel(label);
    setUploadStatus("idle");
    setUploadProgress(0);
  }, []);

  const clear = useCallback(() => {
    setSelectedFile(null);
    setResumeLabel("");
    setUploadStatus("idle");
    setUploadProgress(0);
  }, []);

  useEffect(() => {
    if (!selectedFile) return;

    const focusTimer = window.setTimeout(() => {
      resumeNameInputRef.current?.focus();
      resumeNameInputRef.current?.select();
    }, 180);
    return () => window.clearTimeout(focusTimer);
  }, [selectedFile]);

  useEffect(() => {
    if (uploadStatus !== "uploading") return;

    let timeout: number | undefined;
    const tick = () => {
      setUploadProgress((current) => {
        if (current >= 91) return current;
        return Math.min(
          91,
          current + Math.max(1, Math.round(Math.random() * 8)),
        );
      });
      timeout = window.setTimeout(tick, 140 + Math.random() * 360);
    };

    timeout = window.setTimeout(tick, 140 + Math.random() * 360);
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [uploadStatus]);

  const createResumeForm = useCallback(() => {
    if (!selectedFile) return null;

    const form = new FormData();
    const label = resumeLabel.trim() || selectedFile.name;
    const uploadFilename = /\.pdf$/i.test(label) ? label : `${label}.pdf`;
    form.append("resume", selectedFile, uploadFilename);
    form.append("label", label);
    return form;
  }, [resumeLabel, selectedFile]);

  const uploadResume = useCallback(async () => {
    const form = createResumeForm();
    if (!form) return null;

    setUploadProgress(5);
    setUploadStatus("uploading");
    const [response] = (await Promise.all([
      UserService.uploadMyResume(form),
      sleep(2000),
    ])) as [UploadResumeResponse, void];

    const ok = !!response && response.success !== false;
    setUploadProgress(ok ? 100 : 0);
    setUploadStatus(ok ? "uploaded" : "idle");

    return response;
  }, [createResumeForm]);

  return {
    fileInputRef,
    resumeNameInputRef,
    selectedFile,
    resumeLabel,
    uploadStatus,
    uploadProgress,
    canUpload: !!selectedFile && !!resumeLabel.trim(),
    selectFile,
    updateLabel,
    clear,
    resetUploadState,
    uploadResume,
  };
}

type ResumeUploadFormState = ReturnType<typeof useResumeUploadForm>;

export function ResumeUploadFormFields({
  form,
  placeholder = "e.g. Frontend Developer Resume",
  inputClassName,
}: {
  form: ResumeUploadFormState;
  placeholder?: string;
  inputClassName?: string;
}) {
  return (
    <div className="space-y-4">
      <ResumeUpload
        ref={form.fileInputRef}
        isParsing={false}
        onSelect={form.selectFile}
        onComplete={() => {}}
      />

      <AnimatePresence>
        {form.selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-3 overflow-visible px-0.5 pb-0.5"
          >
            <FormInput
              ref={form.resumeNameInputRef}
              label="Resume label"
              value={form.resumeLabel}
              setter={form.updateLabel}
              className={inputClassName}
              placeholder={placeholder}
              autoComplete="off"
            />
            <ResumeUploadProgress
              status={form.uploadStatus}
              progress={form.uploadProgress}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResumeUploadProgress({
  status,
  progress,
}: {
  status: ResumeUploadStatus;
  progress: number;
}) {
  if (status === "idle") return null;

  const label =
    status === "uploading" ? "Uploading resume..." : "Resume uploaded";

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

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}
