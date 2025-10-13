"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../authctx";

import { Card } from "@/components/ui/card";
import { ErrorLabel } from "@/components/ui/labels";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { isValidEmail, isValidPHNumber } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

/**
 * Display the layout for the forgot password page.
 * @returns Forgot password page.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex justify-center px-6 py-12 pt-12">
      <div className="w-full max-w-2xl h-full">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

/**
 * Layout for the forgot password form.
 */
const ForgotPasswordForm = ({}) => {
  const router = useRouter();
  const { emailStatus: email_status } = useAuthContext(); // check if email exists.
  const [isLoading, setIsLoading] = useState(false);

  // send password reset request if a valid email is entered.
  const handle_request = async (e: React.FormEvent) => {
    e.preventDefault();
  }

  return (
    <>
      <Card className="flex flex-col gap-4">
        <h2 className="text-3xl tracking-tighter font-bold text-gray-700">
          Forgot password
        </h2>
        <FormInput
          label="Email"
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