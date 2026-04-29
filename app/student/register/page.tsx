"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useDbRefs } from "@/lib/db/use-refs";
import { FormDropdown, FormInput } from "@/components/EditForm";
import { useAuthContext } from "@/lib/ctx-auth";
import { useProfileData } from "@/lib/api/student.data.api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IRefsContext } from "@/lib/db/use-refs-backend";
import { useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/lib/api/services";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { DropdownGroup } from "@/components/ui/dropdown";

interface FormInputs {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  university?: string;
  degree?: string;
}

/**
 * The first step to registering where the user puts their personal information in.
 * @param regForm The form data.
 * @param refs Reference table hook.
 * @returns Form for inputting personal information for student registration.
 */
export function RegisterStep({
  regForm,
  refs,
  onSubmit,
  submitting,
}: {
  regForm: UseFormReturn<FormInputs>;
  refs: IRefsContext;
  onSubmit: (values: FormInputs) => void;
  submitting: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl tracking-tight font-bold text-gray-700">
          Let's get started
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-3 w-full">
        <FormInput
          label="First name"
          value={regForm.watch("first_name") || ""}
          maxLength={40}
          setter={(val) => {
            regForm.setValue("first_name", val);
          }}
          placeholder="First name"
        />

        <FormInput
          label="Middle name"
          value={regForm.watch("middle_name") || ""}
          setter={(val) => {
            regForm.setValue("middle_name", val);
          }}
          required={false}
          placeholder="Middle name"
        />

        <FormInput
          label="Last name"
          value={regForm.watch("last_name") || ""}
          maxLength={40}
          setter={(val) => {
            regForm.setValue("last_name", val);
          }}
          className="col-span-1 sm:col-span-2"
          placeholder="Last name"
        />
      </div>

      <FormDropdown
        label="University"
        maxLength={40}
        setter={(val) => {
          regForm.setValue("university", String(val));
          regForm.setValue("degree", "");
        }}
        options={refs.universities}
        tooltip="If your university is not in the list, please contact us at the 'Need help' link."
      />

      <FormDropdown
        label="Degree program"
        maxLength={40}
        setter={(val) => {
          regForm.setValue("degree", String(val));
        }}
        options={refs.get_degrees_by_university(
          regForm.watch("university") || "",
        )}
        disabled={regForm.watch("university") === ""}
      />

      {/* create account */}
      <div className="flex gap-2 justify-end mt-4">
        <Button
          className="w-full sm:w-auto"
          type="button"
          disabled={submitting}
          onClick={(e) =>
            void regForm.handleSubmit(() => onSubmit(regForm.getValues()))(e)
          }
        >
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </>
  );
}

/**
 * The second step to registering where the user verifies their education email
 * to access forms. This step can be skipped during initial onboarding.
 * @param onNextAction Function that runs when the step is finished.
 * @param onSkipAction Function that runs when the step is skipped.
 * @returns Form for inputting the OTP.
 */
export function OTPEmailStep({
  onNextAction,
  onSkipAction,
}: {
  onNextAction: (email: string) => void;
  onSkipAction: () => void;
}) {
  const profile = useProfileData();
  const [sending, setSending] = useState(false);
  const [eduEmail, setEduEmail] = useState(
    profile.data?.edu_verification_email ?? "",
  );
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [error, setError] = useState("");

  // set the education email if it doesn't exist on the user account.
  useEffect(() => {
    if (!eduEmail && profile.data?.edu_verification_email)
      setEduEmail(profile.data.edu_verification_email);
  }, [eduEmail, profile.data?.edu_verification_email]);

  // set the email validity flag when the value is changed.
  useEffect(() => {
    if (!eduEmail?.trim()) return setIsEmailValid(false);
    if (!eduEmail.endsWith(".edu.ph")) return setIsEmailValid(false);
    setIsEmailValid(true);
  }, [eduEmail]);

  const requestOTP = () => {
    if (!isEmailValid || sending) return;
    setSending(true);
    setError("");

    AuthService.requestActivation(eduEmail)
      .then((response) => {
        if (response?.success !== true) {
          console.log("OTP request failed:", response);
          const err =
            response?.message?.trim() ||
            response?.error?.trim() ||
            "Couldn't send OTP. Try again.";
          setError(err);
          return;
        }
        toast.success("OTP sent. Check your inbox for the six-digit code.");
        onNextAction(eduEmail);
      })
      .catch(() => setError("Couldn't send OTP. Try again."))
      .finally(() => setSending(false));
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl tracking-tight font-bold text-gray-700">
          (Optional) Verify your account
        </h1>
        <span className="text-muted-foreground tracking-tight text-sm">
          To access online form signing, you'll need to verify your education
          email. If you don't, you'll still be able to apply to jobs on the
          site.
        </span>
      </div>
      <div className="flex flex-col gap-3 items-end mt-4">
        <div className="w-full">
          <FormInput
            label="Education email"
            value={eduEmail}
            maxLength={40}
            setter={setEduEmail}
            placeholder="student@school.edu.ph"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end items-center">
        <Button
          className="w-full sm:w-auto"
          variant="outline"
          type="button"
          onClick={onSkipAction}
        >
          Skip for now
        </Button>
        <Button
          type="button"
          onClick={requestOTP}
          disabled={!isEmailValid || sending}
        >
          {sending ? "Sending..." : "Send OTP"}
        </Button>
      </div>
    </>
  );
}

export function OTPEnterStep({
  eduEmail,
  onFinishAction,
  onBackAction,
}: {
  eduEmail: string;
  onFinishAction: () => void;
  onBackAction: () => void;
}) {
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [activating, setActivating] = useState(false);
  const activatingRef = useRef(false);

  // resend state
  const [sending, setSending] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(true);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isCoolingDown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isCoolingDown) {
      setIsCoolingDown(false);
    }
  }, [countdown, isCoolingDown]);

  // auto-activate when six digits are entered.
  useEffect(() => {
    if (otp.length !== 6 || activatingRef.current) return;

    activatingRef.current = true;
    setActivating(true);
    setOtpError("");

    AuthService.activate(eduEmail, otp)
      .then(async (response) => {
        await queryClient.invalidateQueries({
          queryKey: ["my-profile"],
        });

        if (response?.success === true) {
          onFinishAction();
        } else {
          setOtpError(
            response?.message?.trim() ||
              response?.error?.trim() ||
              "Verification code not valid.",
          );

          activatingRef.current = false;
        }
      })
      .catch(() => {
        setOtpError("Couldn't verify your code. Try again.");
        activatingRef.current = false;
      })
      .finally(() => setActivating(false));
  }, [otp, eduEmail, onFinishAction, queryClient]);

  // connect to the authentication service to request the otp.
  const requestOTP = () => {
    // check if the otp can be requested before doing anything.
    if (sending || isCoolingDown) return;
    setSending(true);
    setOtpError("");

    AuthService.requestActivation(eduEmail)
      .then((response) => {
        if (response?.success !== true) {
          setOtpError(
            response?.message?.trim() ||
              response?.error?.trim() ||
              "Couldn't send verification code. Try again.",
          );
          return;
        }
        toast.success(
          "Verification code sent. Check your inbox for the six-digit code.",
        );
        setIsCoolingDown(true);
        setCountdown(60);
      })
      .catch(() => setOtpError("Couldn't send verification code. Try again."))
      .finally(() => setSending(false));
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl tracking-tight font-bold text-gray-700">
          Enter verification code
        </h1>
        <span className="text-muted-foreground tracking-tight text-sm">
          We sent a 6-digit code to <strong>{eduEmail}</strong>.
        </span>
        <div className="rounded-[0.5em] border border-primary/20 p-4 space-y-3">
          <div className="text-sm font-medium text-gray-700 text-center">
            Enter the 6-digit code sent to your email
          </div>
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
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={onBackAction}
            disabled={sending || isCoolingDown}
            className="w-full sm:w-auto"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={requestOTP}
            disabled={sending || isCoolingDown}
            className="w-full sm:w-auto"
          >
            {sending
              ? "Sending..."
              : isCoolingDown
                ? `Resend in ${countdown}s`
                : "Resend code"}
          </Button>
        </div>
      </div>
    </>
  );
}

export function RegisterPageContent() {
  const refs = useDbRefs();
  const auth = useAuthContext();
  const profile = useProfileData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [submitting, setSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [step, setStep] = useState(
    searchParams.get("step") === "verify" ? 2 : 1,
  );

  const nextUrl = "/search";

  // modify url params based on current step.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (step === 2 || step === 3) {
      params.set("step", "verify");
    } else {
      params.delete("step");
    }

    const search = params.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [step, pathname, router, searchParams]);

  // Redirect only after we know the profile state
  useEffect(() => {
    if (profile.data?.is_verified) router.replace(nextUrl);
  }, [profile.data?.is_verified, router]);

  // skip main register page if the user is already registered.
  useEffect(() => {
    if (step === 1 && auth.isAuthenticated()) {
      setStep(2);
    }
  }, [step, auth]);

  const regForm = useForm<FormInputs>({
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      university: "",
      degree: "",
    },
  });

  /**
   * Handle form submit
   *
   * @param values
   */
  const handleSubmit = (values: FormInputs) => {
    setSubmitting(true);

    // Check for missing fields
    if (!values.first_name?.trim()) {
      alert("Your first name is required.");
      setSubmitting(false);
      return;
    }

    if (!values.last_name?.trim()) {
      alert("Your last name is required.");
      setSubmitting(false);
      return;
    }

    if (!values.university?.trim()) {
      alert("Your university is required.");
      setSubmitting(false);
      return;
    }

    if (!values.degree?.trim()) {
      alert("Your degree program is required.");
      setSubmitting(false);
      return;
    }

    // Extract fields
    const { university, first_name, middle_name, last_name, degree } = values;

    auth
      .register({
        university,
        first_name,
        middle_name,
        last_name,
        degree,
      })
      .then((response) => {
        if (response?.message) {
          setSubmitting(false);
          alert(response.message);
          return;
        }

        setSubmitting(false);
        setStep(step + 1);
      })
      .catch((error) => {
        setSubmitting(false);
        console.log(error);
        toast.error("Something went wrong... Try again later.");
      });
  };

  return (
    <div className="w-full min-h-screen p-3 bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full min-h-[calc(100vh-1.5rem)]">
        {/* Decorative area */}
        <div className="hidden lg:block lg:col-span-3 min-h-full rounded-[0.33em] overflow-hidden bg-black" />

        {/* Form area */}
        <div className="col-span-1 lg:col-span-2 w-full p-3">
          <div className="flex flex-col justify-between h-full w-full">
            {/* Header */}
            <div className="flex gap-2 items-center">
              <img
                src="/BetterInternshipLogo.png"
                className="w-8 aspect-square"
                alt="BetterInternship"
              />
              <h1 className="text-2xl font-bold tracking-tighter">
                BetterInternship
              </h1>
            </div>

            <div className="space-y-6">
              {step === 1 && !auth.isAuthenticated() && (
                <DropdownGroup>
                  <RegisterStep
                    regForm={regForm}
                    refs={refs}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                  />
                </DropdownGroup>
              )}
              {step === 2 && (
                <OTPEmailStep
                  onNextAction={(email) => {
                    setVerificationEmail(email);
                    setStep(step + 1);
                  }}
                  onSkipAction={() => {
                    location.href = nextUrl;
                  }}
                />
              )}
              {step === 3 && (
                <OTPEnterStep
                  eduEmail={verificationEmail}
                  onFinishAction={() => {
                    location.href = nextUrl;
                  }}
                  onBackAction={() => setStep(step - 1)}
                />
              )}
            </div>

            {/* Contact us */}
            <div className="space-y-3">
              <a
                className="text-sm hover:underline"
                href="mailto:hello@betterinternship.com"
              >
                Need help?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterPageContent />
    </Suspense>
  );
}
