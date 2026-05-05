"use client";

import {
  ResumeUploadFormFields,
  useResumeUploadForm,
} from "@/components/features/student/resume-parser/ResumeUploadForm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Resume } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
import { MONTH_NAMES } from "@/lib/utils/date-utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { RefObject } from "react";

type ApplyStep = 1 | 2 | 3;
type InternshipType = "credited" | "voluntary";
type ResumeUploadFormState = ReturnType<typeof useResumeUploadForm>;

export function ApplyStepHeader({
  step,
  totalSteps,
}: {
  step: ApplyStep;
  totalSteps: number;
}) {
  const title =
    step === 1
      ? "Choose your resume"
      : step === 2
        ? "Internship details"
        : "Cover letter";
  const description =
    step === 1
      ? "Pick an existing resume or upload a new one before applying."
      : step === 2
        ? "These details help companies understand what kind of internship you need."
        : "This listing requires a cover letter.";

  return (
    <div className="relative pr-10">
      <div className="text-xs font-medium uppercase tracking-wide text-primary pt-6">
        Step {step} of {totalSteps}
      </div>
      <h3 className="mt-1 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ResumeStep({
  resumes,
  resumesLoading,
  hasExistingResumes,
  atResumeLimit,
  resumeChoice,
  showUpload,
  resumeUpload,
  canProceed,
  saving,
  onCancel,
  onResumeChoice,
  onShowUpload,
  onContinue,
}: {
  resumes: Resume[];
  resumesLoading: boolean;
  hasExistingResumes: boolean;
  atResumeLimit: boolean;
  resumeChoice: string;
  showUpload: boolean;
  resumeUpload: ResumeUploadFormState;
  canProceed: boolean;
  saving: boolean;
  onCancel: () => void;
  onResumeChoice: (id: string) => void;
  onShowUpload: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4">
      {resumesLoading ? (
        <div className="text-sm text-muted-foreground">Loading resumes...</div>
      ) : (
        hasExistingResumes && (
          <ResumeChoiceList
            resumes={resumes}
            selectedResumeId={resumeChoice}
            onSelect={onResumeChoice}
          />
        )
      )}

      {!resumesLoading && hasExistingResumes && !showUpload && (
        <Button
          type="button"
          variant="link"
          className="p-0"
          onClick={onShowUpload}
          disabled={atResumeLimit}
        >
          Upload new resume
        </Button>
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
              <ResumeUploadFormFields
                form={resumeUpload}
                placeholder="e.g. Frontend Developer Resume"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex justify-between gap-3 pt-4 border-t">
        <Button
          type="button"
          scheme="destructive"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button onClick={onContinue} disabled={!canProceed || saving}>
          {saving ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}

function ResumeChoiceList({
  resumes,
  selectedResumeId,
  onSelect,
}: {
  resumes: Resume[];
  selectedResumeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {resumes.map((resume) => (
        <button
          key={resume.id}
          type="button"
          onClick={() => onSelect(resume.id)}
          className={cn(
            "w-full rounded-[0.33em] border p-3 text-left transition bg-white",
            selectedResumeId === resume.id
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
                <Link
                  href="/profile?section=resumes"
                  target="_blank"
                  className="text-primary hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  View in profile
                </Link>
              </div>
            </div>
            {selectedResumeId === resume.id && (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export function InternshipDetailsStep({
  internshipType,
  month,
  year,
  years,
  saving,
  canApply,
  isReadOnly,
  requiresCoverLetter,
  applyLabel,
  onCancel,
  onBack,
  onInternshipTypeChange,
  onMonthChange,
  onYearChange,
  onContinue,
}: {
  internshipType: InternshipType | null;
  month: string;
  year: string;
  years: number[];
  saving: boolean;
  canApply: boolean;
  isReadOnly: boolean;
  requiresCoverLetter: boolean;
  applyLabel: string;
  onCancel: () => void;
  onBack: () => void;
  onInternshipTypeChange: (type: InternshipType) => void;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 pt-2">
        {isReadOnly ? (
          <InternshipDetailsSummary
            internshipType={internshipType}
            month={month}
            year={year}
          />
        ) : (
          <>
            <InternshipTypeSelector
              value={internshipType}
              onChange={onInternshipTypeChange}
            />
            <ExpectedStartDateSelect
              month={month}
              year={year}
              years={years}
              onMonthChange={onMonthChange}
              onYearChange={onYearChange}
            />
          </>
        )}
      </div>

      <div className="mt-6 flex justify-between gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          scheme="destructive"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="px-2"
            disabled={saving}
          >
            Back
          </Button>
          <Button onClick={onContinue} disabled={!canApply || saving}>
            {saving
              ? "Applying..."
              : requiresCoverLetter
                ? "Continue"
                : applyLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InternshipDetailsSummary({
  internshipType,
  month,
  year,
}: {
  internshipType: InternshipType | null;
  month: string;
  year: string;
}) {
  const startMonth =
    month !== "" && year !== ""
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${MONTH_NAMES[Number(month)]} ${year}`
      : "Not specified";

  return (
    <div className="space-y-4">
      <div className="rounded-[0.33em] font-light border border-gray-200 bg-gray-50 p-4">
        You are applying for{" "}
        {<span className="text-primary font-semibold">{internshipType}</span>}{" "}
        internships
        <br /> and expect to start on{" "}
        {<span className="text-primary font-semibold">{startMonth}</span>}.
      </div>
      <Button asChild variant="link" className="h-auto p-0">
        <Link
          href="/profile?section=internship&edit=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          Edit in profile
        </Link>
      </Button>
    </div>
  );
}

function InternshipTypeSelector({
  value,
  onChange,
}: {
  value: InternshipType | null;
  onChange: (type: InternshipType) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-900">
        Internship Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        {(["credited", "voluntary"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "rounded-[0.33em] border p-3 text-center text-sm font-medium transition bg-white",
              value === type
                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                : "border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-gray-50",
            )}
          >
            {type === "credited" ? "Credited" : "Voluntary"}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExpectedStartDateSelect({
  month,
  year,
  years,
  onMonthChange,
  onYearChange,
}: {
  month: string;
  year: string;
  years: number[];
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}) {
  return (
    <div className="space-y-3 pt-2">
      <label className="text-sm font-medium text-gray-900">
        Expected Start Date
      </label>
      <div className="flex gap-3">
        <select
          className="flex h-10 w-full rounded-[0.33em] border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={month}
          onChange={(event) => onMonthChange(event.target.value)}
        >
          <option value="" disabled>
            Month
          </option>
          {MONTH_NAMES.map((monthName, index) => (
            <option key={monthName} value={index}>
              {monthName}
            </option>
          ))}
        </select>
        <select
          className="flex h-10 w-full rounded-[0.33em] border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={year}
          onChange={(event) => onYearChange(event.target.value)}
        >
          <option value="" disabled>
            Year
          </option>
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CoverLetterStep({
  coverLetter,
  coverLetterRef,
  saving,
  canSubmit,
  applyLabel,
  onCancel,
  onBack,
  onCoverLetterChange,
  onSubmit,
}: {
  coverLetter: string;
  coverLetterRef: RefObject<HTMLTextAreaElement | null>;
  saving: boolean;
  canSubmit: boolean;
  applyLabel: string;
  onCancel: () => void;
  onBack: () => void;
  onCoverLetterChange: (coverLetter: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 pt-2">
        <label
          htmlFor="cover-letter"
          className="text-sm font-medium text-gray-900"
        >
          Cover letter
        </label>
        <Textarea
          id="cover-letter"
          ref={coverLetterRef}
          value={coverLetter}
          onChange={(event) => onCoverLetterChange(event.target.value)}
          placeholder="Write your cover letter here..."
          className="min-h-48 resize-y rounded-[0.33em] border-gray-200 focus-visible:ring-primary"
        />
      </div>

      <div className="mt-6 flex justify-between gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          scheme="destructive"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="px-2"
            disabled={saving}
          >
            Back
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit || saving}>
            {saving ? "Applying..." : applyLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
