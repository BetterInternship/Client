"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal";
import { SquareAsterisk } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AlertTriangle, Repeat } from "lucide-react";
import { useProfileData } from "@/lib/api/student.data.api";
import { AuthService } from "@/lib/api/services";
import { useQueryClient } from "@tanstack/react-query";

export default function VerifyPage() {
  const router = useRouter();
  const nextUrl = "/search";
  const profile = useProfileData();

  const deciding = profile.data === undefined;

  // Redirect only after we know the profile state
  useEffect(() => {
    if (deciding) return;
    if (profile.data?.is_verified) router.replace(nextUrl);
  }, [deciding, profile.data?.is_verified, router]);

  // Prevent any flash
  if (deciding || profile.data?.is_verified) return null;

  return (
    <div className="">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <img
              src="/BetterInternshipLogo.png"
              className="w-36 mx-auto mb-3"
              alt="BetterInternship"
            />
            <h1 className="text-3xl font-bold">Verify your school email</h1>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Card className="p-4 sm:p-6 block w-full max-w-lg">
            <StepActivateOTP onFinish={() => router.replace(nextUrl)} />
          </Card>

          <div className="text-xs text-gray-500 mt-2 text-center">
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
      .then(async (response: any) => {
        await queryClient.invalidateQueries({ queryKey: ["my-profile"] });

        if (response?.success) {
          onFinish();
        } else {
          setOtpError(response?.message ?? "OTP not valid.");
        }
      })
      .catch(() => setOtpError("Couldn’t verify your code. Try again."))
      .finally(() => setActivating(false));
  }, [otp, eduEmail, onFinish]);

  const {
    open: openOTPModal,
    close: closeOTPModal,
    Modal: OTPModal,
  } = useModal("otp-modal");

  const requestOTP = () => {
    if (!isEmailValid || sending || isCoolingDown) return;
    setSending(true);
    setOtpError("");
    AuthService.requestActivation(eduEmail)
      .then((response: any) => {
        if (response?.message && response?.success === false) {
          alert(response.message);
          return;
        }
        // alert("Check your inbox for a 6-digit code.");
        openOTPModal();
        setSent(true);
        setIsCoolingDown(true);
        setCountdown(60);
      })
      .catch(() => setOtpError("Couldn’t send OTP. Try again."))
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
        <p className="text-sm text-gray-600">
          Enter your school email to receive a one-time passcode (OTP).
        </p>

        <div className="mt-3">
          <Input
            type="email"
            placeholder="email@uni.edu.ph"
            onChange={(e) => setEduEmail(e.currentTarget.value)}
          />

          <div className="mt-4">
            {sent && (
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
            )}

            {otpError && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-amber-900 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="text-sm text-gray-600 text-center">
              {activating && (
                <Badge variant="secondary">Activating account...</Badge>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <Button
                type="button"
                onClick={requestOTP}
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

    <OTPModal>
      <div className="p-8">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="flex gap-2">
            <SquareAsterisk className="text-primary h-8 w-8 mb-4" />
            <SquareAsterisk className="text-primary h-8 w-8 mb-4" />
            <SquareAsterisk className="text-primary h-8 w-8 mb-4" />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg">Check your inbox for a 6-digit code.</h3>
            OTP expires in 10 minutes.
          </div>
        </div>
        <div className="flex justify-center gap-6">
          <Button onClick={closeOTPModal}>Ok</Button>
        </div>
      </div>
    </OTPModal>
    </>
  );
}
