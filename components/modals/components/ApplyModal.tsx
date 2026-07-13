"use client";

import { useResumeUploadForm } from "@/components/features/student/resume-parser/ResumeUploadForm";
import { UserService } from "@/lib/api/services";
import { PublicUser } from "@/lib/db/db.types";
import {
  monthYearToTimestampMs,
  timestampMsToMonthYear,
} from "@/lib/utils/date-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ApplyStepHeader,
  InternshipDetailsStep,
  ResumeStep,
} from "./apply-modal-steps";

type InternshipType = "credited" | "voluntary";
type ApplyStep = 1 | 2;

export type ApplyPayload = {
  resumeId: string;
};

export function ApplyModal({
  profile,
  onCancel,
  onApply,
  applyLabel = "Apply",
}: {
  profile: PublicUser | null;
  onCancel: () => void;
  onApply: (payload: ApplyPayload) => void | Promise<void>;
  applyLabel?: string;
}) {
  const queryClient = useQueryClient();
  const resumeUpload = useResumeUploadForm();

  const { data: resumesData, isPending: resumesLoading } = useQuery({
    queryKey: ["my-resumes"],
    queryFn: () => UserService.getMyResumes(),
  });

  const resumes = useMemo(() => resumesData?.resumes ?? [], [resumesData]);
  const hasExistingResumes = resumes.length > 0;
  const maxResumesEnv = Number(process.env.NEXT_PUBLIC_MAX_RESUMES_ALLOWED);
  const maxResumesAllowed = Number.isFinite(maxResumesEnv) ? maxResumesEnv : 5;
  const atResumeLimit = resumes.length >= maxResumesAllowed;

  const initialDate = useMemo(
    () =>
      timestampMsToMonthYear(
        profile?.internship_preferences?.expected_start_date,
      ),
    [profile?.internship_preferences?.expected_start_date],
  );

  const [step, setStep] = useState<ApplyStep>(1);
  const [resumeChoice, setResumeChoice] = useState<string>("new");
  const [showUpload, setShowUpload] = useState(true);
  const [internshipType, setInternshipType] = useState<InternshipType | null>(
    profile?.internship_preferences?.internship_type ?? null,
  );
  const [month, setMonth] = useState(initialDate.month);
  const [year, setYear] = useState(initialDate.year);
  const [saving, setSaving] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);

  const hasSavedInternshipDetails = !!(
    profile?.internship_preferences?.internship_type &&
    profile?.internship_preferences?.expected_start_date
  );
  const totalSteps = 2;
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current + i);
  }, []);

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (resumesLoading || hasInitialized.current) return;
    hasInitialized.current = true;

    if (hasExistingResumes) {
      const defaultResume = resumes.find(
        (resume) => resume.id === resumesData?.default_resume,
      );
      setResumeChoice(defaultResume?.id ?? resumes[0].id);
      setShowUpload(false);
    } else {
      setResumeChoice("new");
      setShowUpload(true);
    }
  }, [resumesLoading, hasExistingResumes, resumes, resumesData]);

  useEffect(() => {
    if (!hasSavedInternshipDetails) return;
    setInternshipType(profile?.internship_preferences?.internship_type ?? null);
    setMonth(initialDate.month);
    setYear(initialDate.year);
  }, [
    hasSavedInternshipDetails,
    initialDate.month,
    initialDate.year,
    profile?.internship_preferences?.internship_type,
  ]);

  const canProceedFromResume =
    resumeChoice !== "new" ? !!resumeChoice : resumeUpload.canUpload;
  const canApply =
    hasSavedInternshipDetails ||
    (!!internshipType && month !== "" && year !== "");

  async function uploadResumeIfNeeded(): Promise<string | null> {
    if (resumeChoice !== "new" || !resumeUpload.selectedFile)
      return resumeChoice !== "new" ? resumeChoice : null;

    const response = await resumeUpload.uploadResume();
    if (response?.success !== false && response?.resume?.id)
      return response.resume.id;

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

        await queryClient.invalidateQueries({ queryKey: ["my-resumes"] });
        setUploadedResumeId(id);
        setResumeChoice(id);
        setShowUpload(false);
        resumeUpload.clear();
      }
      setStep(2);
    } catch (error) {
      console.error(error);
      resumeUpload.resetUploadState();
      toast.error("Could not upload your resume. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApply() {
    if (!canApply) return;

    try {
      setSaving(true);
      const profileUpdate: Partial<PublicUser> = {
        acknowledged_auto_apply: true,
      };

      if (!hasSavedInternshipDetails) {
        profileUpdate.internship_preferences = {
          ...(profile?.internship_preferences ?? {}),
          internship_type: internshipType ?? undefined,
          expected_start_date: monthYearToTimestampMs(
            Number(month),
            Number(year),
          ),
        };
      }

      await UserService.updateMyProfile(profileUpdate);

      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      onCancel();

      const targetResumeId =
        resumeChoice === "new" ? uploadedResumeId : resumeChoice;
      if (!targetResumeId) throw new Error("No resume selected");

      await onApply({
        resumeId: targetResumeId,
      });
    } catch (error) {
      console.error(error);
      toast.error("Could not save your application preferences.");
    } finally {
      setSaving(false);
    }
  }

  function handleDetailsNext() {
    if (!canApply) return;
    void handleApply();
  }

  return (
    <div className="w-full sm:w-[34rem]">
      <div className="space-y-5">
        <ApplyStepHeader step={step} totalSteps={totalSteps} />

        {step === 1 ? (
          <ResumeStep
            resumes={resumes}
            resumesLoading={resumesLoading}
            hasExistingResumes={hasExistingResumes}
            atResumeLimit={atResumeLimit}
            resumeChoice={resumeChoice}
            showUpload={showUpload}
            resumeUpload={resumeUpload}
            canProceed={canProceedFromResume}
            saving={saving}
            onCancel={onCancel}
            onResumeChoice={(id) => {
              setResumeChoice(id);
              setShowUpload(false);
            }}
            onShowUpload={() => {
              setResumeChoice("new");
              setShowUpload(true);
            }}
            onContinue={() => void handleResumeNext()}
          />
        ) : step === 2 ? (
          <InternshipDetailsStep
            internshipType={internshipType}
            month={month}
            year={year}
            years={years}
            saving={saving}
            canApply={canApply}
            isReadOnly={hasSavedInternshipDetails}
            applyLabel={applyLabel}
            onCancel={onCancel}
            onBack={() => setStep(1)}
            onInternshipTypeChange={setInternshipType}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onContinue={handleDetailsNext}
          />
        ) : null}
      </div>
    </div>
  );
}
