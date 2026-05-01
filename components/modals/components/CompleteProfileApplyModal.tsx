"use client";

import { Button } from "@/components/ui/button";
import ResumeUpload from "@/components/features/student/resume-parser/ResumeUpload";
import { FormInput } from "@/components/EditForm";
import { UserService } from "@/lib/api/services";
import { FileText, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PublicUser } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
import Link from "next/link";

type InternshipType = "credited" | "voluntary";
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
  onApply: (resumeId: string) => void | Promise<void>;
  applyLabel?: string;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeNameInputRef = useRef<HTMLInputElement>(null);

  const { data: resumesData, isPending: resumesLoading } = useQuery({
    queryKey: ["my-resumes"],
    queryFn: () => UserService.getMyResumes(),
  });

  const resumes = useMemo(() => resumesData?.resumes ?? [], [resumesData]);
  const hasExistingResumes = resumes.length > 0;

  const initialDate = useMemo(
    () =>
      timestampToMonthYear(
        profile?.internship_preferences?.expected_start_date,
      ),
    [profile?.internship_preferences?.expected_start_date],
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [resumeChoice, setResumeChoice] = useState<string>("new");
  const [showUpload, setShowUpload] = useState(true);

  // Default-select the first existing resume once data loads
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (resumesLoading || hasInitialized.current) return;
    hasInitialized.current = true;

    if (hasExistingResumes) {
      setResumeChoice(resumes[0].id);
      setShowUpload(false);
    } else {
      setResumeChoice("new");
      setShowUpload(true);
    }
  }, [resumesLoading, hasExistingResumes, resumes]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeLabel, setResumeLabel] = useState("");
  const [internshipType, setInternshipType] = useState<InternshipType | null>(
    profile?.internship_preferences?.internship_type ?? null,
  );
  const [month, setMonth] = useState(initialDate.month);
  const [year, setYear] = useState(initialDate.year);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);

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
    resumeChoice !== "new"
      ? !!resumeChoice
      : !!selectedFile && !!resumeLabel.trim();
  const canApply = !!internshipType && month !== "" && year !== "";

  async function uploadResumeIfNeeded(): Promise<string | null> {
    if (resumeChoice !== "new" || !selectedFile) return resumeChoice !== "new" ? resumeChoice : null;

    const form = new FormData();
    const label = resumeLabel.trim() || selectedFile.name;
    const uploadFilename = /\.pdf$/i.test(label) ? label : `${label}.pdf`;
    form.append("resume", selectedFile, uploadFilename);
    form.append("label", label);

    setUploadStatus("uploading");
    const response = (await UserService.updateMyResume(form)) as {
      success?: boolean;
      resume?: { id: string };
    };
    const ok = response.success !== false;
    setUploadStatus(ok ? "uploaded" : "ready");
    
    if (ok && response.resume?.id) {
      return response.resume.id;
    }
    return null;
  }

  async function handleResumeNext() {
    if (!canProceedFromResume) return;

    try {
      setSaving(true);
      if (resumeChoice === "new") {
        const id = await uploadResumeIfNeeded();
        if (!id) {
          toast.error("Could not upload your resume. Please try again.");
          return;
        }
        setUploadedResumeId(id);
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
      
      const targetResumeId = resumeChoice === "new" ? uploadedResumeId : resumeChoice;
      if (!targetResumeId) throw new Error("No resume selected");

      await onApply(targetResumeId);
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
            {resumesLoading ? (
              <div className="text-sm text-muted-foreground">Loading resumes...</div>
            ) : hasExistingResumes && (
              <div className="space-y-2">
                {resumes.map(resume => (
                  <button
                    key={resume.id}
                    type="button"
                    onClick={() => {
                      setResumeChoice(resume.id);
                      setShowUpload(false);
                    }}
                    className={cn(
                      "w-full rounded-[0.33em] border p-3 text-left transition bg-white",
                      resumeChoice === resume.id
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
                          {resume.label || resume.filename || "Untitled resume"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          <Link href="/student/profile" target="_blank" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                            View in profile
                          </Link>
                        </div>
                      </div>
                      {resumeChoice === resume.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!resumesLoading && hasExistingResumes && !showUpload && (
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
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-1 space-y-4">
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
                            placeholder="e.g. Frontend Developer Resume"
                            autoComplete="off"
                          />
                          <UploadProgress status={uploadStatus} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleResumeNext}
                disabled={!canProceedFromResume || saving}
              >
                {saving ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4 pt-2">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">
                  Internship Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInternshipType("credited")}
                    className={cn(
                      "rounded-[0.33em] border p-3 text-center text-sm font-medium transition bg-white",
                      internshipType === "credited"
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-gray-50",
                    )}
                  >
                    Credited
                  </button>
                  <button
                    type="button"
                    onClick={() => setInternshipType("voluntary")}
                    className={cn(
                      "rounded-[0.33em] border p-3 text-center text-sm font-medium transition bg-white",
                      internshipType === "voluntary"
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-gray-50",
                    )}
                  >
                    Voluntary
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-gray-900">
                  Expected Start Date
                </label>
                <div className="flex gap-3">
                  <select
                    className="flex h-10 w-full rounded-[0.33em] border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    <option value="" disabled>
                      Month
                    </option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className="flex h-10 w-full rounded-[0.33em] border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="" disabled>
                      Year
                    </option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="px-2"
                disabled={saving}
              >
                Back
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleApply} disabled={!canApply || saving}>
                  {saving ? "Applying..." : applyLabel}
                </Button>
              </div>
            </div>
          </div>
        )}
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

function timestampToMonthYear(timestamp?: number | null) {
  if (!timestamp) return { month: "", year: "" };
  const d = new Date(timestamp * 1000);
  return {
    month: d.getMonth().toString(),
    year: d.getFullYear().toString(),
  };
}

function monthYearToTimestamp(month: number, year: number) {
  return Math.floor(new Date(year, month, 1).getTime() / 1000);
}
