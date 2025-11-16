"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "../authctx";

import {
  FormInput,
} from "@/components/EditForm";

import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const {
    emailStatus: email_status,
    login,
    redirectIfLoggedIn: redirect_if_logged_in,
    redirectIfNotLoggedIn: redirect_if_not_logged_in,
  } = useAuthContext();

  const [email, setEmail] = useState("");
  const [emailNorm, setEmailNorm] = useState(""); // keep a normalized copy for API calls
  const [password, setPassword] = useState("");
  const [new_account, set_new_account] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  redirect_if_not_logged_in();
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
    <div className="flex-1 flex items-center justify-center px-6 py-12 h-full">
      <div className="flex items-center w-full max-w-2xl h-full">
        <Card className="w-full">
          {/* Welcome Message */}
          <div className="text-3xl tracking-tighter font-bold text-gray-700 mb-4">
            Employer Login
          </div>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 justify-center">{error}</p>
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
              <p className="text-sm text-gray-500">
                <a className="text-blue-600 hover:text-blue-800 underline font-medium" href="/forgot-password">Forgot password?</a>
              </p>
              <div className="flex justify-between items-center w-full">
                <p className="text-sm text-gray-500">
                  Don't have an account? <a className="text-blue-600 hover:text-blue-800 underline font-medium" href="/register">Register here.</a>
                </p>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
