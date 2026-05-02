"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowLeft, Repeat } from "lucide-react";
import { useProfileData } from "@/lib/api/student.data.api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/lib/ctx-auth";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import { useStudentOtpVerification } from "@/hooks/use-student-otp-verification";
import { StudentOtpInput } from "@/components/features/student/register/StudentOtpInput";
import { isEduPhEmail } from "@/lib/utils/string-utils";

const DEFAULT_VERIFICATION_REDIRECT = "/search";

const resolveVerificationRedirect = (redirect: string | null) => {
  const requestedRedirect = redirect?.trim();
  if (!requestedRedirect) return DEFAULT_VERIFICATION_REDIRECT;
  return `/${redirect}`;
};

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redirectIfNotLoggedIn } = useAuthContext();
  const nextUrl = useMemo(
    () => resolveVerificationRedirect(searchParams.get("redirect")),
    [searchParams],
  );
  const profile = useProfileData();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const handleBack = () => {
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  redirectIfNotLoggedIn();

  // Redirect only after we know the profile state
  useEffect(() => {
    if (profile.isPending) return;
    if (profile.data?.is_verified) {
      if (nextUrl) router.replace(nextUrl);
      else return;
    }
    if (!profile.data)
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  }, [
    nextUrl,
    profile.isPending,
    profile.data?.is_verified,
    queryClient,
    router,
  ]);

  const finishVerification = useCallback(() => {
    if (nextUrl) router.replace(nextUrl);
  }, [nextUrl, router]);

  // Prevent hydration mismatch when client restores persisted query cache.
  // Server render and first client render both return null.
  if (!mounted) return null;

  // Wait for profile and auth checks; unauthenticated users are redirected
  if (profile.isPending) return <Loader>Loading...</Loader>;
  if (profile.data?.is_verified) {
    if (nextUrl) {
      router.replace(nextUrl);
      return null;
    } else {
      return <Loader>Loading...</Loader>;
    }
  }
  if (!profile.data) return <Loader>Loading...</Loader>;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-primary/5 via-transparent to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <img
              src="/BetterInternshipLogo.png"
              className="w-32 sm:w-36 mx-auto mb-3"
              alt="BetterInternship"
            />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Verify your school email
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              One last step to activate your student account.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="mx-auto w-full max-w-lg">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 border border-gray-200 bg-white text-muted-foreground shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </div>

          <Card className="p-5 sm:p-7 block w-full max-w-lg border border-primary/20 shadow-md">
            <StepActivateOTP onFinish={finishVerification} />
          </Card>

          <div className="text-xs text-gray-500 mt-2 text-center max-w-md">
            Having trouble? Make sure you typed your .edu.ph email correctly and
            check your spam folder.
          </div>
        </div>
      </div>
    </div>
  );
}

function StepActivateOTP({ onFinish }: { onFinish: () => void }) {
  const profile = useProfileData();
  const [sent, setSent] = useState(false);
  const [eduEmail, setEduEmail] = useState(
    profile.data?.edu_verification_email ?? "",
  );
  const [isEmailValid, setIsEmailValid] = useState(false);
  const {
    activating,
    countdown,
    error: otpError,
    isCoolingDown,
    otpInputProps,
    requestOtp,
    sending,
  } = useStudentOtpVerification({
    email: eduEmail,
    autoActivate: {
      failureMessage: "OTP not valid.",
      onSuccess: onFinish,
    },
  });

  useEffect(() => {
    if (!eduEmail && profile.data?.edu_verification_email) {
      setEduEmail(profile.data.edu_verification_email);
    }
  }, [eduEmail, profile.data?.edu_verification_email]);

  useEffect(() => {
    setIsEmailValid(isEduPhEmail(eduEmail));
  }, [eduEmail]);

  const requestOTP = async () => {
    if (!isEmailValid || sending || isCoolingDown) return;

    const result = await requestOtp({
      failureMessage: "Couldn't send OTP. Try again.",
    });

    if (result?.success !== true) return;

    toast.success(
      "OTP sent. Check your inbox for the 6-digit code.",
      toastPresets.success,
    );
    setSent(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Enter your school email to receive a one-time passcode (OTP).
          </p>

          <div className="mt-3 space-y-4">
            <Input
              type="email"
              placeholder="email@uni.edu.ph"
              className="h-11"
              onChange={(e) => {
                setEduEmail(e.currentTarget.value);
              }}
            />

            <div className="mt-4 space-y-4">
              <div>
                {sent && (
                  <div className="rounded-[0.5em] border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="text-sm font-medium text-gray-700 text-center">
                      Enter the 6-digit code sent to your email
                    </div>
                    <StudentOtpInput {...otpInputProps} />
                  </div>
                )}
              </div>

              {otpError && (
                <div className="mt-3 flex items-center gap-2 rounded-[0.5em] border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="text-sm text-gray-600 text-center">
                {activating && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Activating account...
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex justify-end gap-2 text-sm">
                <Button
                  type="button"
                  onClick={() => void requestOTP()}
                  size={"md"}
                  className="w-full sm:w-auto"
                  disabled={sending || !isEmailValid || isCoolingDown}
                >
                  <Repeat className="h-4 w-4 mr-1" />
                  {!isCoolingDown
                    ? sending
                      ? "Sending..."
                      : sent
                        ? "Resend code"
                        : "Send me a code"
                    : `${countdown}s until you can resend your OTP`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
