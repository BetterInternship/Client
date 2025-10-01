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
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalyzeResume } from "@/hooks/use-register";
import { useRouter } from "next/navigation";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useDbRefs } from "@/lib/db/use-refs";

import ResumeUpload from "@/components/features/student/resume-parser/ResumeUpload";
import { FormInput } from "@/components/EditForm";
import { UserService } from "@/lib/api/services";
import { useProfileData } from "@/lib/api/student.data.api";
import { Stepper } from "../stepper/stepper";
import { isProfileResume, isProfileBaseComplete } from "../../lib/profile";
import { Textarea } from "../ui/textarea";
import { Job } from "@/lib/db/db.types";
import { applyToJob } from "@/lib/application";
import { useApplicationActions } from "@/lib/api/student.actions.api";
import { ModalHandle } from "@/hooks/use-modal";

export function IncompleteProfileContent({
  job,
  onFinish,
  applySuccessModalRef,
}: {
  job?: Job | null;
  onFinish: () => void;
  applySuccessModalRef?: RefObject<ModalHandle | null>;
}) {
  return (
    <div className="p-6 h-full overflow-y-auto pt-0">
      {/* Modal title */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/15 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's finish setting up your profile
        </h2>
      </div>

      <CompleteProfileStepper
        job={job}
        applySuccessModalRef={applySuccessModalRef}
        onFinish={onFinish}
      />
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

function CompleteProfileStepper({
  job,
  onFinish,
  applySuccessModalRef,
}: {
  job?: Job | null;
  onFinish: () => void;
  applySuccessModalRef?: RefObject<ModalHandle | null>;
}) {
  const existingProfile = useProfileData();
  const [step, setStep] = useState(0);

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
  const coverLetterRef = useRef<string>("");
  const applicationActions = useApplicationActions();

  // upload on file
  useEffect(() => {
    if (!file) return;
    setParseError(null);
    setParsedReady(false);
    setIsParsing(true);
    upload(file);
  }, [file]);

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

  const steps = useMemo(() => {
    const s = [];

    // No resume
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

    // Not complete
    if (!isProfileBaseComplete(existingProfile.data)) {
      s.push({
        id: "base",
        title: "Basic details",
        icon: UserCheck,
        canNext: () => !!profile.firstName && !!profile.lastName && !isUpdating,
        component: <StepBasicIdentity value={profile} onChange={setProfile} />,
      });
    }

    // Auto apply not ackowledged
    if (existingProfile.data?.acknowledged_auto_apply === false) {
      s.push({
        id: "auto-apply",
        title: "Auto-apply settings",
        icon: Repeat,
        canNext: () => true,
        component: <StepAutoApply />,
      });
    }

    if (job && job.require_cover_letter) {
      s.push({
        id: "apply",
        title: "Additional job requirements",
        icon: Mail,
        canNext: () => true,
        component: (
          <StepApply
            job={job}
            setText={(text) => (coverLetterRef.current = text)}
          />
        ),
      });
    }

    return s;
  }, [
    file,
    profile,
    isParsing,
    isUpdating,
    parsedReady,
    parseError,
    response,
    existingProfile.data,
  ]);

  const onNext = async () => {
    if (steps[step].id === "resume") {
      setStep(step + 1);
    } else if (steps[step].id === "base") {
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
        if (step + 1 < steps.length) {
          setStep(step + 1);
        } else {
          if (job)
            applyToJob(applicationActions, job, coverLetterRef.current).then(
              (response) => {
                if (!response.success) return alert(response.message);
                applySuccessModalRef?.current?.open();
                onFinish();
              }
            );
        }
      });
    } else if (steps[step].id === "apply") {
      applyToJob(applicationActions, job, coverLetterRef.current).then(
        (response) => {
          if (!response.success) return alert(response.message);
          applySuccessModalRef?.current?.open();
          onFinish();
        }
      );
    }
  };

  return (
    <Stepper
      step={step}
      steps={steps}
      onNext={onNext}
      onBack={() => setStep(step - 1)}
    ></Stepper>
  );
}

/* ---------------------- Step 0: Resume Upload ---------------------- */

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
      {/* Section: Personal */}
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

      {/* Section: Education */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">
          Educational background
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              University
            </label>
            <Autocomplete
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

function StepAutoApply() {
  const router = useRouter();

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
              <Badge type="supportive">New</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              We’ll automatically submit applications for matching roles using
              your saved details. You can turn this off anytime in your profile.
            </p>
          </div>
        </div>

        <div className="pt-0">
          <ul className="list-disc pl-5 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/80">
            <li>Uses your saved profile info to apply to matching roles.</li>
            <li>Respects your filters and preferences.</li>
            <li>Pause or disable anytime from your Profile.</li>
          </ul>

          <div className="mt-3">
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Manage Auto-Apply
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

const StepApply = ({
  job,
  setText: _setText,
}: {
  job?: Job | null;
  setText: (text: string) => void;
}) => {
  const [text, setText] = useState("");
  return (
    <div className="mb-6 space-y-3">
      <Textarea
        value={text}
        onChange={(e) => (
          setText(e.currentTarget.value), _setText(e.currentTarget.value)
        )}
        placeholder={`Dear Hiring Manager,

I am excited to apply for this position because...

Best regards,
[Your name]`}
        className="w-full h-20 p-3 border border-gray-300 rounded-[0.33em] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm overflow-y-auto"
        maxLength={500}
      />
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 flex items-center gap-1">
          💡 <span>Mention specific skills and enthusiasm</span>
        </span>
        <span className="text-gray-500">{text.length}/500</span>
      </div>
    </div>
  );
};

/* ============================== Exports ============================== */

export { CompleteProfileStepper };
