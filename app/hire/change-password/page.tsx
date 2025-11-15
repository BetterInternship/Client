"use client";

import { useState } from "react";
import { useAuthContext } from "../authctx";

import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "@/lib/utils";
import { normalize } from "path";

/**
 * Display the layout for the change password page.
 */

export default function ChangePasswordPage() {
  return (
    <div className="flex justify-center px-6 py-12 h-full">
      <div className="flex justify-center items-center w-full max-w-2xl h-full">
        <ChangePasswordForm />
      </div>
    </div>
  )
}

const ChangePasswordForm = ({}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // change password when submit is clicked.
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

    try {
      // TODO: change password.
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again later.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card className="flex flex-col gap-4 w-full">
      <h2 className="text-3xl tracking-tighter font-bold text-gray-700">
          Change password
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
        <FormInput
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
        />
        <FormInput
          label="Re-enter your password"
          onChange={(e) => setReenterPassword(e.target.value)}
          value={reenterPassword}
          type="password"
        />
        <div className="flex justify-end items-center w-[100%]">
          <Button
            onClick={handle_request}
            disabled={isLoading}
          >
            {isLoading ? "Changing password..." : "Change password"}
          </Button>
        </div>
      </Card>
    </>
  )
}