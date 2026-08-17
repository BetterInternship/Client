"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/EditForm";
import { StudentOtpInput } from "@/components/features/student/register/StudentOtpInput";
import { Loader } from "@/components/ui/loader";
import { useStudentOtpVerification } from "@/hooks/use-student-otp-verification";
import { EmployerAuthService } from "@/lib/api/hire.api";
import { isValidEmail } from "@/lib/utils";
import { useAuthContext } from "../../authctx";
import { HireAuthShell } from "@/components/features/hire/hire-auth-shell";

type RegistrationProfile = Record<string, unknown>;

export default function VerifyHireRegistrationPage() {
  const router = useRouter();
  const { loading, redirectIfLoggedIn, refreshAuthentication, register } =
    useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationProfile, setRegistrationProfile] =
    useState<RegistrationProfile | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [hasSentCode, setHasSentCode] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  redirectIfLoggedIn();

  useEffect(() => {
    const registeredEmail = sessionStorage.getItem("hire-registration-email");
    if (registeredEmail) {
      setEmail(registeredEmail);
      setHasSentCode(true);
    }

    const storedProfile = sessionStorage.getItem("hire-registration-profile");
    if (!storedProfile) return;

    try {
      setRegistrationProfile(JSON.parse(storedProfile) as RegistrationProfile);
    } catch {
      sessionStorage.removeItem("hire-registration-profile");
    }
  }, []);

  const completeActivation = async () => {
    sessionStorage.removeItem("hire-registration-email");
    await refreshAuthentication();
    router.replace("/dashboard");
  };

  const {
    activateOtp,
    activating,
    countdown,
    error,
    isCoolingDown,
    otpInputProps,
    requestOtp,
    sending,
  } = useStudentOtpVerification({
    email: email.trim().toLowerCase(),
    requestOtpAction: (address) =>
      EmployerAuthService.requestActivation(address),
    activateOtpAction: (address, otp) =>
      EmployerAuthService.activate(address, otp),
    autoActivate: {
      enabled: false,
      failureMessage: "Verification code not valid.",
      networkErrorMessage: "Couldn't verify your code. Try again.",
      onSuccess: () => void completeActivation(),
    },
  });

  const submitCode = async () => {
    const result = await activateOtp(otpInputProps.value, {
      failureMessage: "Verification code not valid.",
      networkErrorMessage: "Couldn't verify your code. Try again.",
    });
    if (result?.success) await completeActivation();
  };

  const sendCode = async () => {
    if (!isValidEmail(email) || sending || isCoolingDown || isRegistering)
      return;

    setRegistrationError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (registrationProfile && !accountCreated) {
      if (password.length < 8) {
        setRegistrationError("Password must be at least 8 characters.");
        return;
      }

      const formData = new FormData();
      for (const [key, value] of Object.entries(registrationProfile)) {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        )
          formData.append(key, String(value));
      }
      formData.append("email", normalizedEmail);
      formData.append("password", password);

      setIsRegistering(true);
      try {
        const response = await register(formData);
        if (!response.success) {
          if (response.account_exists) {
            router.push(`/login?email=${encodeURIComponent(normalizedEmail)}`);
            return;
          }
          setRegistrationError(
            response.message || "Couldn't create your account. Try again.",
          );
          return;
        }

        sessionStorage.removeItem("hire-registration-profile");
        sessionStorage.setItem("hire-registration-email", normalizedEmail);
        setAccountCreated(true);
        setHasSentCode(true);
      } catch {
        setRegistrationError("Couldn't create your account. Try again.");
      } finally {
        setIsRegistering(false);
      }
      return;
    }

    const result = await requestOtp({
      failureMessage: "Couldn't send verification code. Try again.",
    });
    if (result?.success) {
      sessionStorage.setItem("hire-registration-email", normalizedEmail);
      setHasSentCode(true);
    }
  };

  if (loading) return <Loader>Loading verification...</Loader>;

  return (
    <HireAuthShell
      title="Verify your email"
      description={
        registrationProfile
          ? "Choose your login details, then we'll send a six-digit code to activate your account."
          : "Enter your work email and we'll send a six-digit code to activate your employer account."
      }
      headerBefore={
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => router.push("/login")}
          className="gap-2 p-0 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormInput
          label="Work email"
          type="email"
          value={email}
          setter={(value) => {
            setEmail(value);
            setHasSentCode(false);
            setRegistrationError("");
          }}
          maxLength={80}
          placeholder="you@company.com"
        />

        {registrationProfile && (
          <div>
            <FormInput
              label="Password"
              type="password"
              value={password}
              setter={(value) => {
                setPassword(value);
                setRegistrationError("");
              }}
              disabled={accountCreated}
              maxLength={100}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Use at least 8 characters.
            </span>
          </div>
        )}

        {hasSentCode && (
          <div className="space-y-4 rounded-[0.5em] border border-primary/20 p-4">
            <p className="mb-3 text-center text-sm font-medium text-gray-700">
              Enter the 6-digit code sent to {email.trim()}.
            </p>
            <StudentOtpInput {...otpInputProps} />
            <div className="text-center">
              <button
                type="button"
                onClick={() => void sendCode()}
                disabled={sending || isCoolingDown}
                className="text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
              >
                {sending
                  ? "Sending..."
                  : isCoolingDown
                    ? `Resend code in ${countdown}s`
                    : "Resend code"}
              </button>
            </div>
          </div>
        )}

        {(registrationError || error) && (
          <div className="flex items-center gap-2 rounded-[0.5em] border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <span>{registrationError || error}</span>
          </div>
        )}

        <div>
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void (hasSentCode ? submitCode() : sendCode())}
            disabled={
              !isValidEmail(email) ||
              sending ||
              isRegistering ||
              activating ||
              (hasSentCode && otpInputProps.value.length < 6) ||
              (!!registrationProfile && !accountCreated && password.length < 8)
            }
          >
            {isRegistering
              ? "Sending code..."
              : activating
                ? "Verifying..."
                : sending
                  ? "Sending..."
                  : hasSentCode
                    ? "Verify and continue"
                    : "Send code"}
          </Button>
        </div>
      </div>
    </HireAuthShell>
  );
}
