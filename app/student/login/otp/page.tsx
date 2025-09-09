"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuthContext } from "@/lib/ctx-auth";
import Countdown from "react-countdown";

export default function OTPPage() {
  const {
    sendOtpRequest: send_otp_request,
    resendOtpRequest: resend_otp_request,
    verifyOtp: verify_otp,
    redirectIfLoggedIn: redirect_if_logged_in,
  } = useAuthContext();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timer, setTimer] = useState<number>(Date.now() + 60000);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  redirect_if_logged_in();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);

      if (typeof window !== "undefined")
        send_otp_request(emailParam).then(
          (r) => !r.success && setError(r.message ?? "")
        );
    } else {
      // If no email, redirect back to login
      router.push("/login");
    }
  }, [searchParams, router, send_otp_request]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    // Clear error when user starts typing
    if (error) {
      setError("");
    }

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, ""); // Only numbers
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("");

    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    otpRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await verify_otp(email, otpString)
        .then((r) =>
          r?.success
            ? router.push("/")
            : (setError("Invalid OTP."), setLoading(false))
        )
        .catch((e) => setError(e.message ?? ""));
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
      // Clear the OTP inputs so user can try again
      setOtp(["", "", "", "", "", ""]);
      // Focus back to first input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      setLoading(false);
    } finally {
    }
  };

  const handleResendOTP = async () => {
    try {
      setResending(true);
      setError("");
      if (!email) return;
      await resend_otp_request(email).then((r) =>
        r?.success
          ? setTimer(Date.now() + 60000)
          : setError(r.message ?? "Could not resend OTP.")
      );
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleBackToEmail = () => {
    router.push("/login");
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6 && !loading && !error) {
      handleVerifyOTP();
    }
  }, [otp, loading, error]);

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Back Arrow */}
          <div className="mb-6">
            <button
              onClick={handleBackToEmail}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h2>
            <p className="text-gray-600">We've sent a verification code to</p>
            <p className="text-gray-900 font-medium">{email}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                // @ts-ignore
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                className="w-12 h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none transition-colors disabled:opacity-50"
                disabled={loading}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOTP}
            disabled={loading || otp.join("").length !== 6}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Didn't receive the code?
              <Countdown
                key={timer}
                date={timer}
                renderer={({ minutes, seconds, completed }) => (
                  <button
                    onClick={handleResendOTP}
                    disabled={resending || loading || !completed}
                    className="ml-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {minutes > 0 || seconds > 0
                      ? `Resend in ${minutes || ""}${minutes ? ":" : ""}${
                          seconds || "00"
                        } seconds`
                      : resending
                      ? "Sending..."
                      : "Resend OTP"}
                  </button>
                )}
              />
              ,
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
