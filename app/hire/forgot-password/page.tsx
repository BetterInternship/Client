"use client";

import { useState } from "react";
import { useAuthContext } from "../authctx";

import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "@/lib/utils";
import { normalize } from "path";

/**
 * Display the layout for the forgot password page.
 * @returns Forgot password page.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex justify-center px-6 py-12 h-full">
      <div className="flex justify-center items-center w-full max-w-2xl h-full">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

/**
 * Layout for the forgot password form.
 */
const ForgotPasswordForm = ({}) => {
  const { emailStatus: email_status } = useAuthContext(); // check if email exists.
  const [email, setEmail] = useState("");
  const [emailNorm, setEmailNorm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // send password reset request if a valid email is entered.
  const handle_request = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const normalized = normalize(email);

    if (!normalized || !isValidEmail(normalized)) {
      setIsLoading(false);
      setError("Enter a valid email.");
      return;
    }

    setEmailNorm(normalized);

    try {
      const r = await email_status(normalized);

      if (r.existing_user) {
        setIsLoading(false);
        // TODO: send email for password reset request.
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again later.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card className="flex flex-col gap-4 w-full">
        <h2 className="text-3xl tracking-tighter font-bold text-gray-700">
          Forgot password
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 justify-center">{error}</p>
          </div>
        )}
        <FormInput
          label="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <div className="flex justify-between items-center w-[100%]">
          <p className="text-sm text-gray-500">
            Already know your password? <a className="text-blue-600 hover:text-blue-800 underline font-medium" href="/login">Log in here.</a>
          </p>
          <Button
            onClick={handle_request}
            disabled={isLoading}
          >
            {isLoading ? "Sending request..." : "Request password reset"}
          </Button>
        </div>
      </Card>
    </>
  )
};