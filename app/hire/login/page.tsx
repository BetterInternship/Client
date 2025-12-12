"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "../authctx";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";

import {
  FormInput,
} from "@/components/EditForm";

import { Card } from "@/components/ui/card";
import { MailCheck, TriangleAlert } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { AnimatePresence, motion } from "framer-motion";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader>Loading login...</Loader>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const {
    emailStatus: email_status,
    login,
    redirectIfLoggedIn: redirect_if_logged_in,
  } = useAuthContext();

  const [email, setEmail] = useState("");
  const [emailNorm, setEmailNorm] = useState(""); // keep a normalized copy for API calls
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const { isMobile } = useAppContext();

  redirect_if_logged_in();

  const normalize = (s: string) => s.trim().toLowerCase();

  const handle_login_request = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const normalized = normalize(email);
    if (!normalized) {
      setIsLoading(false);
      setError("Email is required.");
      return;
    }

    setEmailNorm(normalized);

    try {
      const email_r = await email_status(normalized);
      const r = await login(normalized, password);

      // @ts-ignore
      if (!email_r?.success) {
        setIsLoading(false);
        // @ts-ignore
        alert(r?.message ?? "Unknown error");
        return;
      }

      // @ts-ignore
      if (r?.success) {
        // @ts-ignore
        if (r.god) {
          router.push("/god");
        }

        router.push("/dashboard");
      } else {
        setError("Invalid password.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
      setIsLoading(false);
    }
  };

  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
        animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "flex justify-center py-12 pt-12 h-fit overflow-y-auto",
          isMobile
            ? "px-2"
            : "px-6"
        )}
      >
        <div className="flex items-center w-full max-w-2xl h-full">
          <Card className="w-full">
            {/* Welcome Message */}
            <div className="text-3xl tracking-tighter font-bold text-gray-700 mb-4">
              Employer Login
            </div>
            {/* Error Message */}
            {error && (
              <div className={cn(
                "flex gap-2 items-center mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/50 rounded-lg",
                isMobile ? "flex-col items-start" : ""
              )}>
                <TriangleAlert size={isMobile ? 24 : 20} />
                <span className="text-sm justify-center">{error}</span>
              </div>
            )}

            {/* check email message on successful register */}
            {status === "success" && !error && (
              <div className={cn(
                "flex gap-2 items-center mb-4 p-3 bg-supportive/10 text-supportive border border-supportive/50 rounded-lg",
                isMobile ? "flex-col items-start" : ""
              )}>
                <MailCheck size={isMobile ? 24 : 20} />
                <span className="text-sm justify-center">Registration successful. Please check your email for the password.</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handle_login_request}>
              <div className="flex flex-col gap-4">
                <FormInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <FormInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-between items-center w-full text-sm text-gray-500">
                  <a className="text-blue-600 hover:text-blue-800 underline font-medium" href="/forgot-password">Forgot password?</a>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  Don't have an account? <a className="text-blue-600 hover:text-blue-800 underline font-medium" href="/register">Register here.</a>
                </span>
                <span className="text-muted-foreground text-sm">
                  Need help? Contact us at <a href="tel://09276604999" className="text-blue-600 hover:text-blue-800 underline font-medium">0927 660 4999</a> or on <a href="viber://add?number=639276604999" className="text-blue-600 hover:text-blue-800 underline font-medium">Viber</a>.
                </span>
              </div>
            </form>
          </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
