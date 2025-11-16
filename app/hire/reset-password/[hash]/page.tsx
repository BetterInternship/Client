"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { AuthService, EmployerUserService } from "@/lib/api/services";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";

/**
 * Display the layout for the change password page.
 */

export default function ResetPasswordPage({ 
  params 
} : { 
  params: { hash: string }
}) {
  const { isMobile } = useAppContext();
  const { hash } = params;

  return (
    <div className={cn(
      "flex justify-center py-12 pt-12 h-full overflow-y-auto",
      isMobile
        ? "px-2"
        : "px-6"
    )}>
      <div className="flex justify-center items-center w-full max-w-2xl h-full">
        <ResetPasswordForm hash={hash} />
      </div>
    </div>
  )
}

const ResetPasswordForm = ({
  hash
} : {
  hash: string
}) => {
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  // change password when submit is clicked.
  const handle_request = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== reenterPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const r = await EmployerUserService.resetPassword(hash, reenterPassword);
      
      // @ts-ignore
      setSuccess(r.message || "Password reset successful. Redirecting to login page in five seconds.");
      setIsLoading(false);

      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch (err: any) {
      setError(err?.message ?? "Invalid or expired link. Please try again.");
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <Card className="flex flex-col gap-4 w-full">
          <h2 className="text-3xl tracking-tighter font-bold text-gray-700">
            Success
          </h2>
          <p>{success}</p>
          <a href="/login" className="text-blue-600 hover:text-blue-800 underline font-medium">
            If you are not redirected, click here.
          </a>
        </Card>
      </>
    )
  }

  return (
    <>
      <Card className="flex flex-col gap-4 w-full">
        <h2 className="text-3xl tracking-tighter font-bold text-gray-700">
          Reset your password
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 justify-center">{error}</p>
          </div>
        )}
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
            type="submit"
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