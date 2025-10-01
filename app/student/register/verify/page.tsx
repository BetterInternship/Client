"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useAuthContext } from "@/lib/ctx-auth";
import { useProfileData } from "@/lib/api/student.data.api";
import { AuthService } from "@/lib/api/services";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [eduEmail, setEduEmail] = useState(
    profile.data?.edu_verification_email ?? ""
  );
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [activating, setActivating] = useState(false);

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
      .then((response: any) => {
        if (response?.success) {
          onFinish();
        } else {
          setOtpError(response?.message ?? "OTP not valid.");
        }
      })
      .catch(() => setOtpError("Couldn’t verify your code. Try again."))
      .finally(() => setActivating(false));
  }, [otp, eduEmail, onFinish]);

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
        alert("Check your inbox for a 6-digit code.");
        setSent(true);
        setIsCoolingDown(true);
        setTimeout(() => setIsCoolingDown(false), 60_000); // 60s cooldown
      })
      .catch(() => setOtpError("Couldn’t send OTP. Try again."))
      .finally(() => setSending(false));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600">
          Enter your school email to receive a one-time passcode (OTP).
        </p>

        <div className="mt-3">
          <Input
            type="email"
            placeholder="email@uni.edu.ph"
            defaultValue={profile.data?.edu_verification_email ?? ""}
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
                  : "Please wait…"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
