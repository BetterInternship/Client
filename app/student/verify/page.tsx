"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/lib/ctx-auth";

export default function VerifyPage() {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verify, refreshAuthentication, redirectIfLoggedIn } =
    useAuthContext();

  // Redirect if logged in
  redirectIfLoggedIn();

  // Redirect to home page when verified
  useEffect(() => {
    if (verified) {
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  }, [verified]);

  useEffect(() => {
    const user = searchParams.get("user_id");
    const key = searchParams.get("key");

    if (user && key) {
      verify(user, key)
        .then((r) => {
          if (r && r.success) {
            setVerified(true);
            refreshAuthentication();
            setTimeout(() => router.push("/"), 2000);
          }
        })
        .catch((error) => {
          alert("Verification failed: " + error.message);
          router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams, router, verify]);

  return (
    <div className="h-full bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {loading
              ? "Verifying your account..."
              : verified
              ? "Your account has been verified!"
              : "Check Your Email"}
          </h2>
          {loading && (
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          {!loading && !verified && (
            <p className="text-gray-600 text-xl">
              Please check your inbox for a verification email and click the
              link to verify your account.
            </p>
          )}
          {!loading && verified && (
            <p className="text-green-600 text-xl">
              Redirecting you to the dashboard...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
