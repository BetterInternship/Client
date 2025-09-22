"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MailCheck,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Repeat,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import type { Job } from "@/lib/db/db.types";
import { useAnalyzeResume } from "@/hooks/use-register";
import { ProcessingTransition } from "@/components/features/student/resume-parser/ProcessingTransition";

import { Autocomplete } from "@/components/ui/autocomplete";
import { useDbRefs } from "@/lib/db/use-refs";

import ResumeUpload from "@/components/features/student/resume-parser/ResumeUpload";
import { FormInput } from "@/components/EditForm";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

/* ============================== Bits ============================== */

function AIResumeStatus({
  isParsing,
  parsedKeys,
}: {
  isParsing: boolean;
  parsedKeys: string[];
}) {
  return (
    <>
      {isParsing ? (
        <>
          <div className="w-full">
            <ProcessingTransition promise={undefined} onComplete={() => {}} />
          </div>
          <div className="mt-4 text-[11px] text-gray-500 text-center px-2">
            We’re scanning your profile. In the meantime, review your{" "}
            <span className="font-medium">Basic Details</span>.
          </div>
        </>
      ) : (
        <Card className="p-4 sm:p-5 min-h-[200px]">
          <div className="w-full">
            <div className="text-sm font-medium text-emerald-600 text-center">
              Resume analysis finished
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Fields auto-filled:
            </div>
            <ul className="mt-1 space-y-1 text-xs">
              {parsedKeys.length === 0 ? (
                <li className="text-gray-400 italic">No fields detected.</li>
              ) : (
                parsedKeys.map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="capitalize">{k.replaceAll("_", " ")}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </Card>
      )}
    </>
  );
}

/* ======================== Modal BODY (container) ======================== */

export function IncompleteProfileContent({
  profile,
  job,
  onSave, // optional external handler
}: {
  profile: any;
  job: Job | null;
  onSave?: (payload: any) => Promise<void> | void;
}) {
  async function onComplete(finalProfile: ProfileDraft) {
    const payload = {
      first_name: finalProfile.firstName ?? "",
      middle_name: finalProfile.middleName ?? "",
      last_name: finalProfile.lastName ?? "",
      email: finalProfile.email ?? "",
      phone_number: finalProfile.phone ?? "",
      university: finalProfile.university ?? "",
      college: finalProfile.college ?? "",
      program: finalProfile.degree ?? "",
      degree_notes: finalProfile.degreeNotes ?? "",
      linkedin_link: finalProfile.linkedin ?? "",
      portfolio_link: finalProfile.portfolio ?? "",
    };

    if (onSave) {
      await onSave(payload);
      return;
    }

    const saveUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/me/profile`;
    const res = await fetch(saveUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await safeErrorText(res));
  }

  return (
    <div className="p-6 h-full overflow-y-auto pt-0">
      {/* Modal title */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <UserCheck className="w-8 h-8 text-blue-700" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Finish your profile to apply
        </h2>
      </div>

      <CompleteProfileStepper
        initialProfile={profileToDraft(profile)}
        onComplete={onComplete}
      />
    </div>
  );
}

/* ============================== Types ============================== */

type ProfileDraft = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string; // used for OTP, not editable here
  phone?: string;
  university?: string;
  college?: string;
  degree?: string;
  degreeNotes?: string;
  linkedin?: string;
  portfolio?: string;
  graduation?: string;
  skills?: string;
  summary?: string;
};

type ResumeParsedUserSnake = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone_number?: string;
  university?: string;
  college?: string;
  degree?: string;
  degree_notes?: string;
  email?: string;
  graduation?: string;
  linkedin_link?: string;
  portfolio_link?: string;
  skills?: string | string[];
  summary?: string;
};

async function safeErrorText(r: Response) {
  try {
    const t = await r.text();
    return t || `${r.status} ${r.statusText}`;
  } catch {
    return `${r.status} ${r.statusText}`;
  }
}

function snakeToDraft(u: ResumeParsedUserSnake): Partial<ProfileDraft> {
  const skills =
    typeof u.skills === "string"
      ? u.skills
      : Array.isArray(u.skills)
      ? u.skills.join(", ")
      : undefined;

  return {
    firstName: u.first_name,
    middleName: u.middle_name,
    lastName: u.last_name,
    email: u.email,
    phone: u.phone_number,
    university: u.university,
    college: u.college,
    degree: u.degree,
    degreeNotes: u.degree_notes,
    linkedin: u.linkedin_link,
    portfolio: u.portfolio_link,
    skills,
    summary: u.summary,
    graduation: u.graduation,
  };
}

function profileToDraft(p: any): ProfileDraft {
  if (!p) return {};
  return {
    firstName: p.first_name ?? p.firstName ?? "",
    middleName: p.middle_name ?? p.middleName ?? "",
    lastName: p.last_name ?? p.lastName ?? "",
    email: p.email ?? "",
    phone: p.phone_number ?? p.phone ?? "",
    university: p.university ?? "",
    college: p.college ?? "",
    degree: p.program ?? p.degree ?? "",
    degreeNotes: p.degree_notes ?? "",
    linkedin: p.linkedin_link ?? p.linkedin ?? "",
    portfolio: p.portfolio_link ?? p.portfolio ?? "",
    graduation: p.graduation ?? "",
    skills: Array.isArray(p.skills) ? p.skills.join(", ") : p.skills ?? "",
    summary: p.summary ?? "",
  };
}

/* ============================== Stepper ============================== */

const steps = [
  { id: 0, title: "Upload your resume", icon: Upload },
  { id: 1, title: "Basic details", icon: UserCheck },
  { id: 2, title: "Activate your account", icon: MailCheck },
] as const;

const STEP_SUBTITLES: Record<number, string> = {
  0: "Upload a PDF/DOCX and we’ll auto-fill what we can.",
  1: "Confirm your personal info and education.",
  2: "Enter the 6-digit code we emailed you to verify.",
};

function CompleteProfileStepper({
  initialProfile,
  onComplete,
  finishLabel = "Verify & Save",
}: {
  initialProfile?: ProfileDraft;
  onComplete?: (finalProfile: ProfileDraft) => Promise<void> | void;
  finishLabel?: string;
}) {
  const [step, setStep] = useState(0);

  // profile being edited
  const [profile, setProfile] = useState<ProfileDraft>({
    firstName: initialProfile?.firstName ?? "",
    middleName: initialProfile?.middleName ?? "",
    lastName: initialProfile?.lastName ?? "",
    email: initialProfile?.email ?? "",
    phone: initialProfile?.phone ?? "",
    university: initialProfile?.university ?? "",
    college: initialProfile?.college ?? "",
    degree: initialProfile?.degree ?? "",
    degreeNotes: initialProfile?.degreeNotes ?? "",
    graduation: initialProfile?.graduation ?? "",
    skills: initialProfile?.skills ?? "",
    summary: initialProfile?.summary ?? "",
    linkedin: initialProfile?.linkedin ?? "",
    portfolio: initialProfile?.portfolio ?? "",
  });

  // parsing/upload states
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedReady, setParsedReady] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedKeys, setParsedKeys] = useState<string[]>([]);

  // OTP states
  const [otp, setOtp] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const newlyParsed = Object.keys(extractedUser).filter(
            (k) => (extractedUser as any)[k]
          );
          setParsedKeys((prev) =>
            Array.from(new Set([...prev, ...newlyParsed]))
          );
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

  // Shared Back / Next handlers
  const nextLabel = step === 2 ? finishLabel : "Next";
  const showBack = step > 0;

  const canNext =
    step === 0
      ? Boolean(file) || isParsing
      : step === 1
      ? Boolean(profile.firstName && profile.lastName)
      : step === 2
      ? Boolean(accepted && otp && otp.length === 6 && !busy)
      : true;

  const onNext = async () => {
    if (step === 0) return setStep(1);
    if (step === 1) return setStep(2);
    if (step === 2) {
      setOtpError(null);
      if (otp.length < 6) {
        setOtpError("Please enter the 6-digit code.");
        return;
      }
      if (!accepted) {
        setOtpError("Please agree to the Terms and Privacy Policy.");
        return;
      }
      if (onComplete) {
        setBusy(true);
        try {
          await onComplete(profile);
        } finally {
          setBusy(false);
        }
      }
    }
  };

  const onBack = () => setStep((s) => Math.max(0, s - 1));

  const handleResend = async () => {
    setResending(true);
    try {
      // TODO: hit your resend endpoint
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      setResending(false);
    }
  };

  const ActiveIcon = steps[step].icon;

  return (
    <div className="w-full mx-auto">
      {/* Stepper (top) */}
      <StepperHeader step={step} />

      {/* Per-step header */}
      <div className="mt-6 flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold">
            {steps[step].title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {STEP_SUBTITLES[step]}
          </p>
        </div>
      </div>

      {/* Card body */}
      <Card className="mt-3 shadow-sm border-border/60">
        <div className="">
          {step === 0 && (
            <div className="">
              {!isParsing && (
                <StepResume
                  file={file}
                  isParsing={isParsing}
                  parsedReady={parsedReady}
                  parseError={parseError}
                  onPick={(f) => setFile(f)}
                  fileInputRef={fileInputRef}
                  response={response}
                />
              )}
              {isParsing && (
                <AIResumeStatus isParsing={isParsing} parsedKeys={parsedKeys} />
              )}
            </div>
          )}

          {step === 1 && (
            <StepBasicIdentity value={profile} onChange={setProfile} />
          )}

          {step === 2 && (
            <StepActivateOTP
              email={profile.email ?? ""}
              otp={otp}
              setOtp={setOtp}
              accepted={accepted}
              setAccepted={setAccepted}
              busy={busy}
              otpError={otpError}
              resending={resending}
              onResend={handleResend}
            />
          )}
        </div>
      </Card>

      {/* Shared footer controls (outside the card) */}
      <div className="mt-4 flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          {showBack && (
            <Button type="button" variant="secondary" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button type="button" onClick={onNext} disabled={!canNext}>
            {nextLabel}
            {step < 2 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ========================= Subcomponents ========================= */

function StepperHeader({ step }: { step: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {steps.map((s, idx) => {
        const ActiveIcon = s.icon;
        const active = idx === step;
        const done = idx < step;
        return (
          <motion.div
            key={s.id}
            layout
            className={
              "flex items-center gap-2 rounded-[0.33em] border p-3 " +
              (active
                ? "border-primary/60 bg-primary/5"
                : done
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border/60")
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-inner">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <ActiveIcon
                  className={
                    "h-5 w-5 " +
                    (active ? "text-primary" : "text-muted-foreground")
                  }
                />
              )}
            </div>
            <div className="text-sm font-medium leading-tight">
              <div className="text-xs text-gray-400">Step {idx + 1}</div>
              {s.title}
            </div>
          </motion.div>
        );
      })}
    </div>
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
            <Badge variant="secondary">Parsed</Badge>
          ) : isParsing ? (
            <Badge variant="outline">Parsing…</Badge>
          ) : (
            <Badge variant="outline">Waiting…</Badge>
          )}
        </div>
      )}

      {isParsing && (
        <div className="mt-3 text-xs text-gray-500">
          We’re scanning your profile. You can go ahead to <b>Basic details</b>{" "}
          while this completes.
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

/* -------- Step 1: Basic Identity (clean sections + grid) -------- */

function StepBasicIdentity({
  value,
  onChange,
}: {
  value: ProfileDraft;
  onChange: (v: ProfileDraft) => void;
}) {
  const refs = useDbRefs();

  const universityOptions = refs.universities;
  const degreeOptions = useMemo(() => {
    return refs.degrees.filter((d) =>
      refs.get_degrees_by_university(value.university ?? "").includes(d.id)
    );
  }, [value.university, refs]);

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

      <Separator />

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
            <Autocomplete
              value={value.degree ?? ""}
              options={degreeOptions}
              setter={(val: any) => onChange({ ...value, degree: val })}
              placeholder="Select degree…"
            />
          </div>
        </div>
      </div>

      {/* <Separator /> */}

      {/* Section: Links */}
      {/* <div>
        <h4 className="text-sm font-medium text-muted-foreground">Links</h4>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="LinkedIn URL"
            required={false}
            placeholder="https://linkedin.com/in/username"
            value={value.linkedin}
            setter={(v) => onChange({ ...value, linkedin: v })}
          />
          <FormInput
            label="Portfolio / Website"
            required={false}
            placeholder="https://your.site"
            value={value.portfolio}
            setter={(v) => onChange({ ...value, portfolio: v })}
          />
        </div>
      </div> */}
    </div>
  );
}

/* --------------------------- Step 2: Activate (OTP) --------------------------- */

function StepActivateOTP({
  email,
  otp,
  setOtp,
  accepted,
  setAccepted,
  busy,
  otpError,
  resending,
  onResend,
}: {
  email: string;
  otp: string;
  setOtp: (v: string) => void;
  accepted: boolean;
  setAccepted: (b: boolean) => void;
  busy: boolean;
  otpError: string | null;
  resending: boolean;
  onResend: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">
          Email verification
        </h4>
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium">{email || "your email"}</span>. Enter
            it below to activate your account.
          </p>

          <div className="mt-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {otpError && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-amber-900 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Didn’t get the code?
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResend}
                disabled={resending || busy}
              >
                <Repeat className="h-4 w-4 mr-1" />
                {resending ? "Resending…" : "Resend"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(Boolean(v))}
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground">
          I agree to the Terms and Privacy Policy.
        </label>
      </div>
    </div>
  );
}

/* ============================== Exports ============================== */

export { CompleteProfileStepper };
