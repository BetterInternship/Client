"use client";

import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  UserCheck,
  FileText,
  AlertTriangle,
  Repeat,
  User,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalyzeResume } from "@/hooks/use-register";
import { useDbRefs } from "@/lib/db/use-refs";
import ResumeUpload from "@/components/features/student/resume-parser/ResumeUpload";
import { FormDropdown, FormInput } from "@/components/EditForm";
import { UserService } from "@/lib/api/services";
import { useProfileData } from "@/lib/api/student.data.api";
import { Stepper } from "../stepper/stepper";
import { isProfileResume, isProfileBaseComplete } from "../../lib/profile";
import { ModalHandle } from "@/hooks/use-modal";

/* ============================== Modal shell ============================== */

export function IncompleteProfileContent({
  onFinish,
}: {
  onFinish: () => void;
  applySuccessModalRef?: RefObject<ModalHandle | null>;
  job?: unknown | null;
}) {
  return (
    <div className="p-6 h-full overflow-y-auto pt-0">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/15 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's finish setting up your profile
        </h2>
      </div>

      <CompleteProfileStepper onFinish={onFinish} />
    </div>
  );
}

/* ============================== Types ============================== */

type ProfileDraft = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  university?: string;
  degree?: string;
};

type ResumeParsedUserSnake = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone_number?: string;
  university?: string;
  degree?: string;
};

function snakeToDraft(u: ResumeParsedUserSnake): Partial<ProfileDraft> {
  return {
    firstName: u.first_name,
    middleName: u.middle_name,
    lastName: u.last_name,
    phone: u.phone_number,
    university: u.university,
    degree: u.degree,
  };
}

/* ============================== Main Stepper ============================== */

function CompleteProfileStepper({ onFinish }: { onFinish: () => void }) {
  const existingProfile = useProfileData();
  const [step, setStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  // profile being edited
  const [profile, setProfile] = useState<ProfileDraft>({
    firstName: existingProfile.data?.first_name ?? "",
    middleName: existingProfile.data?.middle_name ?? "",
    lastName: existingProfile.data?.last_name ?? "",
    phone: existingProfile.data?.phone_number ?? "",
    university: existingProfile.data?.university ?? "",
    degree: existingProfile.data?.degree ?? "",
  });

  // parsing/upload states
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [parsedReady, setParsedReady] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // analyze
  const { upload, fileInputRef, response } = useAnalyzeResume(file);
  const handledResponseRef = useRef<Promise<any> | null>(null);

  // upload on file
  useEffect(() => {
    if (!file) return;
    setParseError(null);
    setParsedReady(false);
    setIsParsing(true);
    upload(file);
  }, [file, upload]);

  // hydrate once per promise
  useEffect(() => {
    if (!response || handledResponseRef.current === response) return;
    handledResponseRef.current = response;

    let cancelled = false;
    response
      .then(({ extractedUser }: { extractedUser?: ResumeParsedUserSnake }) => {
        if (cancelled) return;
        if (extractedUser) {
          const patch = snakeToDraft(extractedUser);
          setProfile((p) => ({ ...p, ...patch }));
        }
        setParsedReady(true);
        setIsParsing(false);
        setStep(1);
      })
      .catch((e: any) => {
        if (!cancelled) {
          setParseError(e?.message || "Failed to analyze resume.");
          setIsParsing(false);
          setParsedReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [response]);

  // Build REAL steps (completion is NOT part of this array)
  const steps = useMemo(() => {
    const s: Array<{
      id: "resume" | "base" | "auto-apply";
      title: string;
      subtitle?: string;
      icon: any;
      canNext: () => boolean;
      component: React.ReactNode;
    }> = [];

    if (!isProfileResume(existingProfile.data)) {
      s.push({
        id: "resume",
        title: "Upload your resume",
        subtitle: "Upload a PDF and we'll auto-fill what we can.",
        icon: Upload,
        canNext: () => !!file && !isParsing,
        component: (
          <StepResume
            file={file}
            isParsing={isParsing}
            parsedReady={parsedReady}
            parseError={parseError}
            onPick={(f) => setFile(f)}
            fileInputRef={fileInputRef}
            response={response}
          />
        ),
      });
    }

    if (!isProfileBaseComplete(existingProfile.data)) {
      s.push({
        id: "base",
        title: "Basic details",
        icon: UserCheck,
        canNext: () => !!profile.firstName && !!profile.lastName && !isUpdating,
        component: <StepBasicIdentity value={profile} onChange={setProfile} />,
      });
    }

    if (existingProfile.data?.acknowledged_auto_apply === false) {
      s.push({
        id: "auto-apply",
        title: "Auto-apply settings",
        icon: Repeat,
        canNext: () => !isUpdating,
        component: <StepAutoApply />,
      });
    }

    return s;
  }, [
    file,
    isParsing,
    parsedReady,
    parseError,
    response,
    existingProfile.data,
    profile,
    isUpdating,
  ]);

  // Edge case: nothing to show? go straight to complete
  useEffect(() => {
    if (steps.length === 0) {
      setShowComplete(true);
    }
  }, [steps.length]);

  // Next behavior
  const onNext = async () => {
    const current = steps[step];

    if (!current) return;

    if (current.id === "resume") {
      // purely client transition
      setStep(step + 1);
      return;
    }

    if (current.id === "base") {
      setIsUpdating(true);
      UserService.updateMyProfile({
        first_name: profile.firstName ?? "",
        middle_name: profile.middleName ?? "",
        last_name: profile.lastName ?? "",
        phone_number: profile.phone ?? "",
        university: profile.university ?? "",
        degree: profile.degree ?? "",
      }).then(() => {
        setIsUpdating(false);
        const isLast = step + 1 >= steps.length;
        if (isLast) setShowComplete(true);
        else setStep(step + 1);
      });
      return;
    }

    if (current.id === "auto-apply") {
      setIsUpdating(true);
      UserService.updateMyProfile({ acknowledged_auto_apply: true }).then(
        () => {
          setIsUpdating(false);
          const isLast = step + 1 >= steps.length;
          if (isLast) setShowComplete(true);
          else setStep(step + 1);
        }
      );
      return;
    }
  };

  // Render completion screen OUTSIDE the stepper
  if (showComplete) {
    return <StepComplete onDone={onFinish} />;
  }

  return (
    <Stepper
      step={step}
      steps={steps}
      onNext={onNext}
      onBack={() => setStep(Math.max(0, step - 1))}
    />
  );
}

/* ---------------------- Step: Resume Upload ---------------------- */

function StepResume({
  file,
  isParsing,
  parsedReady,
  parseError,
  onPick,
  fileInputRef,
  response,
}: {
  file: File | null;
  isParsing: boolean;
  parsedReady: boolean;
  parseError: string | null;
  onPick: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  response: Promise<any> | null;
}) {
  return (
    <div>
      <ResumeUpload
        ref={fileInputRef}
        promise={response ?? undefined}
        isParsing={isParsing}
        onSelect={(f) => onPick(f)}
        onComplete={() => {}}
      />

      {file && (
        <div className="mt-4 flex items-center justify-between rounded-[0.33em] border bg-background p-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="text-sm">
              <div className="font-medium leading-none">{file.name}</div>
              <div className="text-muted-foreground text-xs">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
          {parsedReady ? (
            <Badge type="supportive">Parsed</Badge>
          ) : isParsing ? (
            <Badge type="warning">Parsing...</Badge>
          ) : (
            <Badge type="warning">Waiting...</Badge>
          )}
        </div>
      )}

      {parseError && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-amber-900 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{parseError}</span>
        </div>
      )}
    </div>
  );
}

/* ---------------------- Step: Basic Identity ---------------------- */

function StepBasicIdentity({
  value,
  onChange,
}: {
  value: ProfileDraft;
  onChange: (v: ProfileDraft) => void;
}) {
  const refs = useDbRefs();
  const universityOptions = refs.universities;

  return (
    <div className="flex flex-col gap-6">
      {/* Personal */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">
          Personal information
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="First name"
              value={value.firstName}
              setter={(v) => onChange({ ...value, firstName: v })}
            />
            <FormInput
              label="Middle name"
              required={false}
              value={value.middleName}
              setter={(v) => onChange({ ...value, middleName: v })}
            />
            <FormInput
              label="Last name"
              value={value.lastName}
              setter={(v) => onChange({ ...value, lastName: v })}
            />
          </div>

          <FormInput
            label="Phone number"
            value={value.phone}
            setter={(v) => onChange({ ...value, phone: v })}
          />
        </div>
      </div>

      {/* Education */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">
          Educational background
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <div>
            <FormDropdown
              label="University"
              required
              value={value.university ?? ""}
              options={universityOptions}
              setter={(val: any) =>
                onChange({
                  ...value,
                  university: val,
                  degree: "",
                })
              }
              placeholder="Select university…"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Degree / Program
            </label>
            <FormInput
              value={value.degree ?? ""}
              setter={(val: any) => onChange({ ...value, degree: val })}
              placeholder="Select degree…"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Step: Auto-Apply Acknowledge ---------------------- */

function StepAutoApply() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-emerald-300/60 bg-emerald-50 dark:bg-emerald-900/20">
        <div className="flex flex-row items-start gap-3">
          <div className="rounded-full p-2 bg-emerald-100 dark:bg-emerald-800/60">
            <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-200" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-none">Auto-Apply is ON</h3>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground p-1 mt-2 text-justify">
          We’ll automatically submit applications for matching roles using your
          saved details. You can turn this off anytime in your profile.
        </p>
      </Card>
    </div>
  );
}

/* ---------------------- Completion (rendered OUTSIDE stepper) ---------------------- */

function StepComplete({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Check animation */}
      <div className="relative mt-2">
        <div className="w-20 h-20 rounded-full border-4 border-emerald-200 grid place-items-center animate-[pop_420ms_ease-out]">
          <svg
            className="w-10 h-10 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M20 6L9 17l-5-5"
              className="animate-[draw_420ms_ease-out_120ms_forwards] opacity-0"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-4">Profile complete</h3>
      <p className="text-sm text-muted-foreground mt-1">
        You’re all set. Nice work!
      </p>

      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(0.8);
            opacity: 0.2;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes draw {
          0% {
            stroke-dasharray: 0 32;
            opacity: 1;
          }
          100% {
            stroke-dasharray: 32 0;
            opacity: 1;
          }
        }
        @keyframes fall {
          0% {
            transform: translateY(-12px) rotate(0deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(32px) rotate(280deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ============================== Exports ============================== */
export { CompleteProfileStepper };
