"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/EditForm";
import { StudentOtpInput } from "@/components/features/student/register/StudentOtpInput";
import { HeaderTitle } from "@/components/ui/text";
import { Loader } from "@/components/ui/loader";
import { useStudentOtpVerification } from "@/hooks/use-student-otp-verification";
import { EmployerAuthService } from "@/lib/api/hire.api";
import { isValidEmail } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";
import { useBlurTransition } from "@/components/animata/blur";
import { motion } from "framer-motion";
import { useAuthContext } from "../../authctx";

export default function VerifyHireRegistrationPage() {
  const router = useRouter();
  const { loading, redirectIfLoggedIn, refreshAuthentication } =
    useAuthContext();
  const { isMobile } = useAppContext();
  const [email, setEmail] = useState("");
  const [hasSentCode, setHasSentCode] = useState(false);
  const blurTransition = useBlurTransition();

  redirectIfLoggedIn();

  useEffect(() => {
    const registeredEmail = sessionStorage.getItem("hire-registration-email");
    if (registeredEmail) {
      setEmail(registeredEmail);
      setHasSentCode(true);
    }
  }, []);

  const completeActivation = async () => {
    sessionStorage.removeItem("hire-registration-email");
    await refreshAuthentication();
    router.replace("/dashboard");
  };

  const {
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
      enabled: hasSentCode,
      failureMessage: "Verification code not valid.",
      networkErrorMessage: "Couldn't verify your code. Try again.",
      onSuccess: () => void completeActivation(),
    },
  });

  const sendCode = async () => {
    if (!isValidEmail(email) || sending || isCoolingDown) return;

    const result = await requestOtp({
      failureMessage: "Couldn't send verification code. Try again.",
    });
    if (result?.success) {
      sessionStorage.setItem("hire-registration-email", email.trim());
      setHasSentCode(true);
    }
  };

  if (loading) return <Loader>Loading verification...</Loader>;

  return (
    <motion.div
      {...blurTransition}
      className={cn(
        "flex flex-1 justify-center overflow-y-auto py-12",
        isMobile ? "px-2" : "px-6",
      )}
    >
      <Card className="h-fit w-full max-w-xl">
        <HeaderTitle icon={MailCheck}>Verify your email</HeaderTitle>
        <p className="mb-5 text-sm text-muted-foreground">
          Enter your work email and we&apos;ll send a six-digit code to activate
          your employer account.
        </p>

        <div className="flex flex-col gap-4">
          <FormInput
            label="Work email"
            type="email"
            value={email}
            setter={(value) => {
              setEmail(value);
              setHasSentCode(false);
            }}
            maxLength={80}
            placeholder="you@company.com"
          />

          {hasSentCode && (
            <div className="rounded-[0.5em] border border-primary/20 p-4">
              <p className="mb-3 text-center text-sm font-medium text-gray-700">
                Enter the 6-digit code sent to {email.trim()}.
              </p>
              <StudentOtpInput {...otpInputProps} />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-[0.5em] border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/login")}
            >
              Back to login
            </Button>
            <Button
              type="button"
              onClick={() => void sendCode()}
              disabled={!isValidEmail(email) || sending || isCoolingDown}
            >
              {sending
                ? "Sending..."
                : isCoolingDown
                  ? `Resend in ${countdown}s`
                  : hasSentCode
                    ? "Resend code"
                    : "Send code"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
