"use client";

import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { ErrorLabel } from "@/components/ui/labels";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const LoginPage = () => {
  const [tin, setTin] = useState("");
  const [tinError, setTinError] = useState("");
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

  return (
    <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
      <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
        Welcome to the DLSU MOA portal!
      </div>
      <div className="text-gray-700 text-xl">
        Start or manage your Memorandum of Agreement with De La Salle University
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
        size="lg"
        type="button"
        scheme="supportive"
        disabled={loading}
        onClick={() => {
          if (!tinError.trim()) {
            setLoading(true);
            router.push("/register");
          }
        }}
      >
        {loading ? "Checking..." : "Continue"}
      </Button>
    </div>
  );
};

export default LoginPage;
