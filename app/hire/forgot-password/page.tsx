"use client";

import { Suspense, useState } from "react";

import { FormInput } from "@/components/EditForm";
import { Button } from "@betterinternship/components";
import { EmployerUserService } from "@/lib/api/services";
import { cn } from "@betterinternship/components";
import { useAppContext } from "@/lib/ctx-app";
import { MailCheck, TriangleAlert } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { HireAuthShell } from "@/components/features/hire/hire-auth-shell";

/**
 * Display the layout for the forgot password page.
 */
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Loader>Loading password reset...</Loader>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

const ForgotPasswordForm = () => {
  const GENERIC_RESET_MESSAGE =
    "If an account with that email exists, a reset link will be sent shortly.";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { isMobile } = useAppContext();

  // send password reset request if a valid email is entered.
  const handle_request = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await EmployerUserService.requestPasswordReset(email.toLowerCase());
      setMessage(GENERIC_RESET_MESSAGE);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        // Keep response generic to avoid account-enumeration leaks.
        setMessage(GENERIC_RESET_MESSAGE);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HireAuthShell
      title="Reset password"
      description="Enter the email associated with your employer account and we'll send you a link to reset your password."
      footer={
        <>
          Remember your password?{" "}
          <a className="font-medium text-primary" href="/login">
            Log in here
          </a>
          .
        </>
      }
    >
      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div
            className={cn(
              "flex gap-2 items-center mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/50 rounded-[0.33em]",
              isMobile ? "flex-col items-start" : "",
            )}
          >
            <TriangleAlert size={isMobile ? 24 : 20} />
            <span className="text-sm justify-center">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div
            className={cn(
              "mb-4 rounded-[0.33em] bg-emerald-600 px-4 py-3 text-white mt-4",
              isMobile
                ? "flex flex-col items-start gap-2"
                : "flex items-center gap-2",
            )}
          >
            <MailCheck size={isMobile ? 24 : 20} />
            <span className="text-sm">{message}</span>
          </div>
        )}

        {/* Forgot Password Form */}
        <form
          onSubmit={(event) => void handle_request(event)}
          className="space-y-4"
        >
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={false}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Sending request..." : "Request password reset"}
          </Button>
        </form>

        <span className="text-muted-foreground text-sm">
          Need help? Contact us at{" "}
          <a
            href="tel://09276604999"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            0927 660 4999
          </a>{" "}
          or on{" "}
          <a
            href="viber://add?number=639276604999"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Viber
          </a>
          .
        </span>
      </div>
    </HireAuthShell>
  );
};
