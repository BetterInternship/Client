"use client";

import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { ErrorLabel } from "@/components/ui/labels";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const LoginPage = () => {
  const [page, setPage] = useState<"login" | "otp" | "register">("login");
  const [tin, setTin] = useState("");
  const [otp, setOtp] = useState("");
  const [tinError, setTinError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!/^(?:\d{12}|\d{3}-\d{3}-\d{3}-\d{3})$/.test(tin) && tin.trim())
        return setTinError("Invalid TIN.");
      else return setTinError("");
    }, 150);

    return () => clearTimeout(timeout);
  }, [tin]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!/^\d{6}$/.test(otp) && otp.trim())
        return setOtpError("Invalid OTP.");
      else return setOtpError("");
    }, 150);

    return () => clearTimeout(timeout);
  }, [otp]);

  switch (page) {
    case "login":
      return (
        <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
          <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
            Welcome to the DLSU MOA portal!
          </div>
          <div className="text-gray-700 text-xl">
            Start or manage your Memorandum of Agreement with De La Salle
            University
          </div>
          <div className="flex flex-row items-end gap-8">
            <FormInput
              label="Company Tax Identification Number (TIN)"
              value={tin}
              setter={(value) => setTin(value)}
              className="border-gray-400 placeholder-gray-200"
              placeholder="123-456-789-000"
              required={false}
            />
            <ErrorLabel value={tinError} />
          </div>
          <Button
            type="button"
            scheme="supportive"
            onClick={() => {
              if (!tinError.trim()) setPage("otp");
            }}
          >
            Continue
          </Button>
        </div>
      );
    case "otp":
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
    case "register":
      return <></>;
    default:
      return <></>;
  }
};

export default LoginPage;
