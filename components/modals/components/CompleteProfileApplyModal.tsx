"use client";

import { Button } from "@/components/ui/button";
import ResumeUpload from "@/components/features/student/resume-parser/ResumeUpload";
import { FormInput } from "@/components/EditForm";
import { UserService } from "@/lib/api/services";
import { FileText, Loader2, CheckCircle2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PublicUser } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";

type InternshipType = "credited" | "voluntary";
type ResumeChoice = "existing" | "new";
type UploadStatus = "idle" | "ready" | "uploading" | "uploaded";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CompleteProfileApplyModal({
  profile,
  onCancel,
  onApply,
  applyLabel = "Apply",
}: {
  profile: PublicUser | null;
  onCancel: () => void;
  onApply: () => void | Promise<void>;
  applyLabel?: string;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeNameInputRef = useRef<HTMLInputElement>(null);
  const hasExistingResume = !!profile?.resume?.trim();

  const initialDate = useMemo(
    () =>
      timestampToMonthYear(
        profile?.internship_preferences?.expected_start_date,
      ),
    [profile?.internship_preferences?.expected_start_date],
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [resumeChoice, setResumeChoice] = useState<ResumeChoice>(
    hasExistingResume ? "existing" : "new",
  );
  const [showUpload, setShowUpload] = useState(!hasExistingResume);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeLabel, setResumeLabel] = useState("");
  const [internshipType, setInternshipType] = useState<InternshipType | null>(
    profile?.internship_preferences?.internship_type ?? null,
  );
  const [month, setMonth] = useState(initialDate.month);
  const [year, setYear] = useState(initialDate.year);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

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

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current + i);
  }, []);

  const canProceedFromResume =
    resumeChoice === "existing"
      ? hasExistingResume
      : !!selectedFile && !!resumeLabel.trim();
  const canApply = !!internshipType && month !== "" && year !== "";

  async function uploadResumeIfNeeded() {
    if (resumeChoice !== "new" || !selectedFile) return true;

    const form = new FormData();
    const label = resumeLabel.trim() || selectedFile.name;
    const uploadFilename = /\.pdf$/i.test(label) ? label : `${label}.pdf`;
    form.append("resume", selectedFile, uploadFilename);
    form.append("resume_label", label);

    setUploadStatus("uploading");
    const response = (await UserService.updateMyResume(form)) as {
      success?: boolean;
    };
    const ok = response.success !== false;
    setUploadStatus(ok ? "uploaded" : "ready");
    return ok;
  }

  async function handleResumeNext() {
    if (!canProceedFromResume) return;

    try {
      setSaving(true);
      const uploadOk = await uploadResumeIfNeeded();
      if (!uploadOk) {
        toast.error("Could not upload your resume. Please try again.");
        return;
      }
      setStep(2);
    } catch (error) {
      console.error(error);
      setUploadStatus("ready");
      toast.error("Could not upload your resume. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApply() {
    if (!canApply) return;

    try {
      setSaving(true);
      await UserService.updateMyProfile({
        acknowledged_auto_apply: true,
        internship_preferences: {
          ...(profile?.internship_preferences ?? {}),
          internship_type: internshipType ?? undefined,
          expected_start_date: monthYearToTimestamp(
            Number(month),
            Number(year),
          ),
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      onCancel();
      await onApply();
    } catch (error) {
      console.error(error);
      toast.error("Could not save your application preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full sm:w-[34rem]">
      <div className="space-y-5">
        <div className="relative pr-10">
          <div className="text-xs font-medium uppercase tracking-wide text-primary pt-6">
            Step {step} of 2
          </div>
          <h3 className="mt-1 text-xl font-semibold text-gray-900">
            {step === 1 ? "Choose your resume" : "Internship details"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 1
              ? "Pick an existing resume or upload a fresh PDF before applying."
              : "These details help companies understand what kind of internship you need."}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            {hasExistingResume && (
              <button
                type="button"
                onClick={() => {
                  setResumeChoice("existing");
                  setShowUpload(false);
                }}
                className={cn(
                  "w-full rounded-[0.33em] border p-3 text-left transition bg-white",
                  resumeChoice === "existing"
                    ? "border-primary ring-2 ring-primary/15"
                    : "border-gray-200 hover:border-primary/70",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[0.33em] bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">
                      {profile?.resume ?? "Saved resume"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Saved to your profile
                    </div>
                  </div>
                  {resumeChoice === "existing" && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            )}

            {hasExistingResume && !showUpload && (
              <button
                type="button"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setResumeChoice("new");
                  setShowUpload(true);
                }}
              >
                Upload new resume
              </button>
            )}

            <AnimatePresence initial={false}>
              {showUpload && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -8 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <ResumeUpload
                    ref={fileInputRef}
                    isParsing={false}
                    onSelect={(file) => {
                      setResumeChoice("new");
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
                        className="mt-3"
                      >
                        <FormInput
                          ref={resumeNameInputRef}
                          label="Resume name"
                          value={resumeLabel}
                          setter={(value) => {
                            setResumeLabel(value);
                            setUploadStatus("ready");
                          }}
                          placeholder="Name this resume"
                        />
                        <UploadProgress status={uploadStatus} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-sm font-medium text-gray-800">
                Are you planning to credit this internship?
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ChoiceButton
                  active={internshipType === "credited"}
                  onClick={() => setInternshipType("credited")}
                >
                  For Credit
                </ChoiceButton>
                <ChoiceButton
                  active={internshipType === "voluntary"}
                  onClick={() => setInternshipType("voluntary")}
                >
                  Voluntary
                </ChoiceButton>
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-gray-800">
                When do you expect to take this internship?
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-10 rounded-[0.33em] border border-gray-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="">Month</option>
                  {MONTHS.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-10 rounded-[0.33em] border border-gray-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="">Year</option>
                  {years.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center border-t pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Cancel
          </Button>
          <div className="ml-auto flex justify-end gap-2">
            {step === 2 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={saving}
              >
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button
                disabled={!canProceedFromResume || saving}
                onClick={() => void handleResumeNext()}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Next
              </Button>
            ) : (
              <Button
                disabled={!canApply || saving}
                onClick={() => void handleApply()}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {applyLabel}
              </Button>
            )}
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

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-[0.33em] border px-3 text-sm font-medium transition",
        active
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-gray-300 bg-white text-gray-700 hover:border-primary/70",
      )}
    >
      {children}
    </button>
  );
}

function stripPdfExtension(name: string) {
  return name.replace(/\.pdf$/i, "");
}

function timestampToMonthYear(timestamp?: number | null) {
  if (!timestamp) return { month: "", year: "" };
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return { month: "", year: "" };
  return {
    month: String(date.getMonth()),
    year: String(date.getFullYear()),
  };
}

function monthYearToTimestamp(month: number, year: number) {
  return new Date(year, month, 1).getTime();
}
