"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AlertTriangle, Repeat } from "lucide-react";
import { useProfileData } from "@/lib/api/student.data.api";
import { AuthService } from "@/lib/api/services";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/lib/ctx-auth";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";

export default function VerifyPage() {
  const router = useRouter();
  const { redirectIfNotLoggedIn } = useAuthContext();
  const nextUrl = "/search";
  const profile = useProfileData();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  redirectIfNotLoggedIn();

  // Redirect only after we know the profile state
  useEffect(() => {
    if (profile.isPending) return;
    if (profile.data?.is_verified) router.replace(nextUrl);
    if (!profile.data)
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  }, [profile.isPending, profile.data?.is_verified, router]);

  // Prevent hydration mismatch when client restores persisted query cache.
  // Server render and first client render both return null.
  if (!mounted) return null;

  // Wait for profile and auth checks; unauthenticated users are redirected
  if (profile.isPending) return <Loader>Loading...</Loader>;
  if (profile.data?.is_verified) return router.replace(nextUrl);
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
          <Card className="p-5 sm:p-7 block w-full max-w-lg border border-primary/20 shadow-md">
            <StepActivateOTP onFinish={() => router.replace(nextUrl)} />
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
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [eduEmail, setEduEmail] = useState(
    profile.data?.edu_verification_email ?? "",
  );
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [activating, setActivating] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!eduEmail && profile.data?.edu_verification_email) {
      setEduEmail(profile.data.edu_verification_email);
    }
  }, [eduEmail, profile.data?.edu_verification_email]);

  useEffect(() => {
    if (!eduEmail?.trim()) return setIsEmailValid(false);
    if (!eduEmail.endsWith(".edu.ph")) return setIsEmailValid(false);
    setIsEmailValid(true);
  }, [eduEmail]);

  // auto-activate once 6 digits entered
  useEffect(() => {
    if (otp.length !== 6) return;
    setActivating(true);
    setOtpError("");
    AuthService.activate(eduEmail, otp)
      .then(async (response) => {
        await queryClient.invalidateQueries({ queryKey: ["my-profile"] });

        if (response?.success === true) {
          onFinish();
        } else {
          setOtpError(
            response?.message?.trim() ||
              response?.error?.trim() ||
              "OTP not valid.",
          );
        }
      })
      .catch(() => setOtpError("Couldn't verify your code. Try again."))
      .finally(() => setActivating(false));
  }, [otp, eduEmail, onFinish, queryClient]);

  const requestOTP = () => {
    if (!isEmailValid || sending || isCoolingDown) return;
    setSending(true);
    setOtpError("");
    AuthService.requestActivation(eduEmail)
      .then((response) => {
        if (response?.success !== true) {
          console.log("OTP request failed:", response);
          const err =
            response?.message?.trim() ||
            response?.error?.trim() ||
            "Couldn't send OTP. Try again.";
          setOtpError(err);
          return;
        }
        toast.success(
          "OTP sent. Check your inbox for the 6-digit code.",
          toastPresets.success,
        );
        setSent(true);
        setIsCoolingDown(true);
        setCountdown(60);
      })
      .catch(() => setOtpError("Couldn't send OTP. Try again."))
      .finally(() => setSending(false));
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isCoolingDown) {
      setIsCoolingDown(false);
    }
  }, [countdown, isCoolingDown]);

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
              onChange={(e) => setEduEmail(e.currentTarget.value)}
            />

            <div className="mt-4 space-y-4">
              <div>
                {sent && (
                  <div className="rounded-[0.5em] border border-primary/20 bg-primary/5 p-4 space-y-3">
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
                  onClick={requestOTP}
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
