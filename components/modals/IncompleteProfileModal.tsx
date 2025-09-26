"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  UserCheck,
  MailCheck,
  FileText,
  AlertTriangle,
  Repeat,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalyzeResume } from "@/hooks/use-register";

import { Autocomplete } from "@/components/ui/autocomplete";
import { useDbRefs } from "@/lib/db/use-refs";

import ResumeUpload from "@/components/features/student/resume-parser/ResumeUpload";
import { FormInput } from "@/components/EditForm";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthService, UserService } from "@/lib/api/services";
import { Input } from "../ui/input";
import { useProfile } from "@/lib/api/student.api";
import { useQueryClient } from "@tanstack/react-query";
import { Stepper } from "../stepper/stepper";
import {
  isProfileResume,
  isProfileBaseComplete,
  isProfileVerified,
} from "../../lib/profile";

export function IncompleteProfileContent({
  handleClose,
}: {
  handleClose: () => void;
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

      <CompleteProfileStepper onFinish={handleClose} />
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

function profileToDraft(p: any): ProfileDraft {
  if (!p) return {};
  return {
    firstName: p.first_name ?? p.firstName ?? "",
    middleName: p.middle_name ?? p.middleName ?? "",
    lastName: p.last_name ?? p.lastName ?? "",
    phone: p.phone_number ?? p.phone ?? "",
    university: p.university ?? "",
    degree: p.program ?? p.degree ?? "",
  };
}

function CompleteProfileStepper({ onFinish }: { onFinish: () => void }) {
  const queryClient = useQueryClient();
  const existingProfile = useProfile();
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

    // Not verified
    if (!isProfileVerified(existingProfile.data)) {
      s.push({
        id: "activation",
        title: "Activate your account",
        subtitle: "Verify your university email and start applying now!",
        icon: MailCheck,
        hideNext: true,
        component: (
          <StepActivateOTP
            onFinish={() => {
              queryClient.invalidateQueries({ queryKey: ["my-profile"] });
              onFinish();
            }}
          />
        ),
      });
    }

    return s;
  }, [file, profile, isParsing, isUpdating]);

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
        if (step + 1 < steps.length - 1) setStep(step + 1);
        else onFinish();
      });
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

/* --------------------------- Step 2: Activate (OTP) --------------------------- */

function StepActivateOTP({ onFinish }: { onFinish: () => void }) {
  const profile = useProfile();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sending, setSending] = useState(false);
  const [eduEmail, setEduEmail] = useState(
    profile.data?.edu_verification_email ?? ""
  );
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!eduEmail.trim()) return setIsEmailValid(false);
    if (!eduEmail.endsWith(".edu.ph")) return setIsEmailValid(false);
    setIsEmailValid(true);
  }, [eduEmail]);

  useEffect(() => {
    if (otp.length === 6) {
      setActivating(true);
      AuthService.activate(eduEmail, otp).then((response) => {
        if (response.success) {
          onFinish();
        } else {
          alert(response.message ?? "OTP not valid.");
        }
        setActivating(false);
      });
    }
  }, [otp]);

  return (
    <div className="space-y-6">
      <div>
        <div className="mt-3">
          <Input
            placeholder="email@uni.edu.ph"
            defaultValue={profile.data?.edu_verification_email ?? ""}
            onChange={(e) => setEduEmail(e.currentTarget.value)}
          />

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

            <div className="text-sm text-gray-600 text-center">
              {activating && <Badge type="accent">Activating account...</Badge>}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <Button
                type="button"
                onClick={() => {
                  AuthService.requestActivation(eduEmail)
                    .then((response) => {
                      if (response.message) {
                        setSending(false);
                        alert(response.message);
                        return;
                      }

                      alert("Check your inbox for an email.");
                      setSending(false);
                      setIsCoolingDown(true);
                      setTimeout(() => setIsCoolingDown(false), 60000);
                    })
                    .catch(setOtpError);
                  setSending(true);
                }}
                disabled={sending || !isEmailValid || isCoolingDown}
              >
                <Repeat className="h-4 w-4 mr-1" />
                {!isCoolingDown
                  ? sending
                    ? "Sending..."
                    : "Send me an OTP"
                  : `Resend`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Exports ============================== */

export { CompleteProfileStepper };
