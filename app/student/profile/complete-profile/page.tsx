"use client";

import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  UserCheck,
  FileText,
  AlertTriangle,
  Repeat,
  User,
  ArrowLeft,
  TriangleAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalyzeResume } from "@/hooks/use-register";
import ResumeUpload from "@/components/features/student/resume-parser/ResumeUpload";
import { FormDropdown, FormInput } from "@/components/EditForm";
import { UserService } from "@/lib/api/services";
import { useProfileData } from "@/lib/api/student.data.api";
import { Stepper } from "@/components/stepper/stepper";
import {
  isProfileResume,
  isProfileBaseComplete,
} from "../../../../lib/profile";
import { ModalHandle } from "@/hooks/use-modal";
import { isValidPHNumber } from "@/lib/utils";
import { useDbRefs } from "@/lib/db/use-refs";
import { Job } from "@/lib/db/db.types";
import { isValidRequiredUserName } from "@/lib/utils/name-utils";
import { DropdownGroup } from "@/components/ui/dropdown";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";

/* ============================== Modal shell ============================== */

export default function IncompleteProfileContent({
  onFinish,
}: {
  onFinish: () => void;
  applySuccessModalRef?: RefObject<ModalHandle | null>;
  job?: Job | null;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col justify-start items-center p-6 h-full overflow-y-auto sm:max-w-2xl mx-auto pt-20">
      <div className="text-center mb-10 w-full shrink-0">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={router.back}>
            <ArrowLeft className="!h-6 !w-6 text-gray-500" />
          </Button>
        </div>
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/15 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's finish setting up your profile
        </h2>
      </div>
      <div className="w-full">
        <CompleteProfileStepper onFinish={onFinish} />
      </div>
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
  college?: string;
  department?: string;
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
    // university: u.university,
    // degree: u.degree,
  };
}

/* ============================== Main Stepper ============================== */

function CompleteProfileStepper({ onFinish }: { onFinish: () => void }) {
  const existingProfile = useProfileData();
  const [step, setStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // profile being edited
  const [profile, setProfile] = useState<ProfileDraft>(() => ({
    firstName: existingProfile.data?.first_name ?? "",
    middleName: existingProfile.data?.middle_name ?? "",
    lastName: existingProfile.data?.last_name ?? "",
    phone: existingProfile.data?.phone_number ?? "",
    university: existingProfile.data?.university ?? "",
    college: existingProfile.data?.college ?? "",
    department: existingProfile.data?.department ?? "",
    degree: existingProfile.data?.degree ?? "",
  }));

  const [autoApply, setAutoApply] = useState<boolean | null>(true);

  // parsing/upload states
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [parsedReady, setParsedReady] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const {
    open: openFileFailModal,
    close: closeFileFailModal,
    Modal: FileFailModal,
  } = useModal("file-fail-modal", { showCloseButton: false });

  // analyze
  const { upload, fileInputRef, response } = useAnalyzeResume(file);
  const handledResponseRef = useRef<any>(null);

  // upload on file
  useEffect(() => {
    if (!file) return;
    setParseError(null);
    setParsedReady(false);
    setIsParsing(true);
    void upload(file);
  }, [file]);

  // hydrate once per promise
  useEffect(() => {
    if (!response || handledResponseRef.current === response) return;
    handledResponseRef.current = response;

    const { extractedUser, message, success } = response as {
      success?: boolean;
      message?: string;
      extractedUser?: ResumeParsedUserSnake;
    };

    if (extractedUser) {
      const patch = snakeToDraft(extractedUser);
      setProfile((p) => ({ ...p, ...patch }));
    }
    setParsedReady(true);
    setIsParsing(false);

    if (success) {
      setStep(1);
    } else if (!success && message) {
      setStep(0);
      openFileFailModal();
      setParseError(message || "Failed to analyze resume.");
      setIsParsing(false);
      setParsedReady(false);
    }
  }, [response]);

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
        canNext: () => !!file && !isParsing && uploadSuccess,
        component: (
          <StepResume
            file={file}
            isParsing={isParsing}
            parsedReady={parsedReady}
            parseError={parseError}
            onPick={(f) => setFile(f)}
            fileInputRef={
              fileInputRef as unknown as RefObject<HTMLInputElement>
            }
            response={response ?? null}
          />
        ),
      });
    }

    if (!isProfileBaseComplete(existingProfile.data)) {
      s.push({
        id: "base",
        title: "Basic details",
        icon: UserCheck,
        canNext: () => {
          const phoneValid = isValidPHNumber(profile.phone);
          return (
            !!profile.firstName &&
            isValidRequiredUserName(profile.firstName) &&
            !!profile.lastName &&
            isValidRequiredUserName(profile.lastName) &&
            !isUpdating &&
            phoneValid &&
            !!profile.degree &&
            !!profile.college &&
            !!profile.department
          );
        },
        component: <StepBasicIdentity value={profile} onChange={setProfile} />,
      });
    }

    if (existingProfile.data?.acknowledged_auto_apply === false) {
      s.push({
        id: "auto-apply",
        title: "Auto-apply settings",
        icon: Repeat,
        canNext: () => autoApply !== null && !isUpdating,
        component: <StepAutoApply value={autoApply} onChange={setAutoApply} />,
      });
    }

    return s;
  }, [
    isParsing,
    parsedReady,
    parseError,
    response,
    existingProfile.data,
    profile,
    isUpdating,
    autoApply,
  ]);

  useEffect(() => {
    if (steps.length === 0) {
      setShowComplete(true);
    }
  }, [steps.length]);

  // Next behavior
  const onNext = async () => {
    const current = steps[step];

    console.log(current);

    if (!current) return;

    if (current.id === "resume") {
      if (!uploadSuccess) {
        return;
      }
      setStep(step + 1);
      return;
    }

    if (current.id === "base") {
      setIsUpdating(true);
      const fullName = [
        profile?.firstName ?? "",
        profile?.middleName ?? "",
        profile?.lastName ?? "",
      ]
        .filter(Boolean)
        .join(" ");
      await UserService.updateMyProfile({
        first_name: profile.firstName ?? "",
        middle_name: profile.middleName ?? "",
        last_name: profile.lastName ?? "",
        phone_number: profile.phone ?? "",
        university: profile.university ?? "",
        degree: profile.degree ?? "",
        college: profile.college ?? "",
        department: profile.department ?? "",
        internship_moa_fields: {
          student: {
            "student-degree": profile.degree ?? "",
            "student-college": profile.college ?? "",
            "student-full-name": fullName,
            "student-first-name": profile.firstName ?? "",
            "student-middle-name": profile.middleName ?? "",
            "student-last-name": profile.lastName ?? "",
            "student-department": profile.department ?? "",
            "student-university": profile.university ?? "",
            "student-phone-number": profile.phone ?? "",
          },
        },
      })
        .then(() => {
          setIsUpdating(false);
          const isLast = step + 1 >= steps.length;
          if (isLast) setShowComplete(true);
          else setStep(step + 1);
        })
        .catch((e) => console.log(e));
      return;
    }

    if (current.id === "auto-apply") {
      if (autoApply === null) return;

      setIsUpdating(true);
      await UserService.updateMyProfile({
        acknowledged_auto_apply: true,
        apply_for_me: autoApply,
      }).then(() => {
        setIsUpdating(false);
        const isLast = step + 1 >= steps.length;
        if (isLast) {
          setShowComplete(true);
          void queryClient.invalidateQueries({
            queryKey: ["my-profile"],
          });
          setTimeout(() => {
            router.push("/profile");
          }, 1500);
        } else setStep(step + 1);
      });
      return;
    }
  };

  if (showComplete) {
    return <StepComplete onDone={onFinish} />;
  }

  return (
    <>
      <DropdownGroup>
        <Stepper
          step={step}
          steps={steps}
          onNext={() => void onNext()}
          onBack={() => setStep(Math.max(0, step - 1))}
        />
      </DropdownGroup>

      <FileFailModal>
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <TriangleAlert className="text-primary h-8 w-8 mb-4 mt-0" />
            <div className="flex flex-col items-center">
              <h3 className="text-lg">Could not upload file</h3>
              <p className="text-gray-500 text-sm">
                Please try again with a different file
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-6">
            <Button onClick={closeFileFailModal}>Try Again</Button>
          </div>
        </div>
      </FileFailModal>
    </>
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
  const {
    colleges,
    departments,
    get_departments_by_college,
    to_department_name,
    to_university_name,
    get_colleges_by_university,
    to_college_name,
  } = useDbRefs();

  const phoneInvalid = useMemo(
    () => !!value.phone && !isValidPHNumber(value.phone),
    [value.phone],
  );

  const firstNameInvalid = useMemo(
    () => !!value.firstName && !isValidRequiredUserName(value.firstName),
    [value.firstName],
  );

  const lastNameInvalid = useMemo(
    () => !!value.lastName && !isValidRequiredUserName(value.lastName),
    [value.lastName],
  );

  const [departmentOptions, setDepartmentOptions] =
    useState<{ id: string; name: string }[]>(departments);

  const [collegesOptions, setCollegesOptions] =
    useState<
      { id: string; name: string; short_name: string; university_id: string }[]
    >(colleges);

  // for realtime updating the department based on the college
  useEffect(() => {
    const collegeId = value.college;

    if (collegeId) {
      const list = get_departments_by_college?.(collegeId);
      setDepartmentOptions(
        list.map((d) => ({
          id: d,
          name: to_department_name(d) ?? "",
        })),
      );
    } else {
      // no college selected -> empty department options
      setDepartmentOptions(
        departments.map((d) => ({ id: d.id, name: d.name })),
      );
      if (value.department) {
        onChange({ ...value, department: undefined });
      }
    }
  }, [
    value.college,
    value.department,
    departments,
    get_departments_by_college,
    to_department_name,
    onChange,
  ]);

  // for realtime updating the college based on the university
  useEffect(() => {
    const universityId = value.university;

    if (universityId) {
      const list = get_colleges_by_university?.(universityId) ?? [];
      const mapped = list.map((d) => ({
        id: d,
        name: to_college_name(d) ?? "",
        short_name: "",
        university_id: universityId,
      }));
      setCollegesOptions(mapped);

      // If the currently selected college is not in the new mapped list, clear it (and department)
      if (value.college && !mapped.some((c) => c.id === value.college)) {
        onChange({ ...value, college: undefined, department: undefined });
      }
    } else {
      // no university selected -> show all colleges and clear college/department
      setCollegesOptions(
        colleges.map((d) => ({
          id: d.id,
          name: d.name,
          short_name: d.short_name,
          university_id: d.university_id,
        })),
      );

      // Clear selected college and department because no university is chosen
      if (value.college || value.department) {
        onChange({ ...value, college: undefined, department: undefined });
      }
    }
  }, [
    value.university,
    value.college,
    value.department,
    colleges,
    get_colleges_by_university,
    to_college_name,
    onChange,
  ]);

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

          {firstNameInvalid && (
            <p className="text-xs text-destructive -mt-2">
              Please enter a first name. Special characters are not allowed.
            </p>
          )}
          {lastNameInvalid && (
            <p className="text-xs text-destructive -mt-2">
              Please enter a last name. Special characters are not allowed.
            </p>
          )}

          <FormInput
            label="Phone number"
            value={value.phone}
            setter={(v) => onChange({ ...value, phone: v })}
          />
          {phoneInvalid && (
            <p className="text-xs text-destructive -mt-2">
              Please enter a valid mobile number (e.g., 639XXXXXXXXX).
            </p>
          )}
        </div>
      </div>

      {/* Education */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">
          Educational background
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <div>
            <FormDropdown
              required
              label="College"
              value={value.college ?? ""}
              setter={(val) => onChange({ ...value, college: val.toString() })}
              options={collegesOptions}
              placeholder="Select college…"
            />
          </div>

          <div>
            <FormDropdown
              required
              label="Department"
              value={value.department ?? ""}
              setter={(val) =>
                onChange({ ...value, department: val.toString() })
              }
              options={departmentOptions}
              placeholder="Select department…"
              disabled={value.college === ""}
            />
          </div>
          <div>
            <FormInput
              required
              label="Degree / Program"
              value={value.degree ?? ""}
              setter={(val) => onChange({ ...value, degree: val.toString() })}
              placeholder="Select degree / program…"
              disabled={value.department === ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Step: Auto-Apply Acknowledge ---------------------- */

function StepAutoApply({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-emerald-300/60 bg-emerald-50 dark:bg-emerald-900/20">
        <div className="p-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Turn on Auto-Apply?</h3>
            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] border border-emerald-300 bg-emerald-100/70">
              Recommended
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            We’ll auto-submit matching roles using your saved details.{" "}
          </p>

          {/* Native select to avoid extra deps; replace with shadcn Select if you prefer */}
          <div className="mt-3">
            <label className="text-sm block mb-1">Auto-Apply preference</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={value === null ? "" : value ? "yes" : "no"}
              onChange={(e) => onChange(e.target.value === "yes")}
            >
              <option value="yes">Yes, enable</option>
              <option value="no">No, not now</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              You can change this anytime in your profile.
            </p>
          </div>
        </div>
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
      <p className="text-sm text-muted-foreground mt-1">
        Please wait while we redirect you...
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
