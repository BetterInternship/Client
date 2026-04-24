"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { EmployerUserService } from "@/lib/api/services";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { HelpCircle, MailCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderIcon, HeaderText } from "@/components/ui/text";

/**
 * Display the layout for the change password page.
 */

export default function ResetPasswordPage({
  params,
}: {
  params: { hash: string };
}) {
  const { isMobile } = useAppContext();
  const { hash } = params;

  return (
    <div
      className={cn(
        "flex justify-center py-12 pt-12 h-full overflow-y-auto",
        isMobile ? "px-2" : "px-6",
      )}
    >
      <div className="flex justify-center items-center w-full max-w-2xl h-full">
        <ResetPasswordForm hash={hash} />
      </div>
    </div>
  );
}

const ResetPasswordForm = ({ hash }: { hash: string }) => {
  const REDIRECT_MS = 5000;
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [redirectProgress, setRedirectProgress] = useState(0);

  const router = useRouter();

  useEffect(() => {
    if (!success) return;

    const startedAt = Date.now();

    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min((elapsed / REDIRECT_MS) * 100, 100);
      setRedirectProgress(progress);
    }, 50);

    const redirectTimer = window.setTimeout(() => {
      setRedirectProgress(100);
      router.push("/login");
    }, REDIRECT_MS);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [success, router]);

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
      setSuccess(
        r.message ||
          "Password reset successful. Redirecting to login page in five seconds.",
      );
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message ?? "Invalid or expired link. Please try again.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
          animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full"
        >
          <Card className="relative overflow-hidden flex flex-col gap-4 w-full">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[0.33em] overflow-hidden bg-emerald-100">
              <div
                className="h-full bg-emerald-600 transition-[width] duration-75 ease-linear"
                style={{ width: `${redirectProgress}%` }}
              />
            </div>
            <div className="flex flex-row items-center gap-3 mb-2">
              <HeaderIcon icon={MailCheck} />
              <HeaderText>Password updated</HeaderText>
            </div>
            <div className="mb-2 flex items-center gap-2 rounded-[0.33em] bg-emerald-600 px-4 py-3 text-white">
              <MailCheck className="h-5 w-5" />
              <p className="text-sm text-white">{success}</p>
            </div>
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              If you are not redirected, click here.
            </a>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
        animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full"
      >
        <Card className="flex flex-col gap-4 w-full">
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={HelpCircle} />
            <HeaderText>Reset password</HeaderText>
          </div>
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
            <Button type="submit" onClick={handle_request} disabled={isLoading}>
              {isLoading ? "Changing password..." : "Change password"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
