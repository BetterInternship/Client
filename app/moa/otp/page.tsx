"use client";

import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { ErrorLabel } from "@/components/ui/labels";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const LoginPage = () => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!/^\d{6}$/.test(otp) && otp.trim())
        return setOtpError("Invalid OTP.");
      else return setOtpError("");
    }, 150);

    return () => clearTimeout(timeout);
  }, [otp]);

  return (
    <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
      <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
        Verify your email.
      </div>
      <div className="text-gray-700 text-xl">
        We've sent a 6-digit verification code to your email address. Please
        enter it below.
      </div>
      <div className="flex flex-row items-end gap-8">
        <FormInput
          label="Verification Code"
          value={otp}
          setter={(value) => setOtp(value)}
          className="border-gray-400 placeholder-gray-200"
          placeholder="------"
          required={false}
        />
        <ErrorLabel value={otpError} />
      </div>
      <Button
        type="button"
        scheme="supportive"
        disabled={loading}
        onClick={() => {
          if (!otpError.trim()) {
            setLoading(true);
            router.push("/dashboard");
          }
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </div>
  );
};

export default LoginPage;
