"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/lib/ctx-auth";
import { MultipartFormBuilder } from "@/lib/multipart-form";

export default function LoginPage() {
  const { emailStatus, register, redirectIfLoggedIn } = useAuthContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  redirectIfLoggedIn();

  // Check if user just registered
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "pending" && error.trim() === "") {
      setShowVerificationMessage(true);
    }
  }, [searchParams, error]);

  const validateDLSUEmail = (email: string): boolean => {
    const dlsuDomains = [
      "@dlsu.edu.ph",
      "@students.dlsu.edu.ph",
      "@staff.dlsu.edu.ph",
      "@faculty.dlsu.edu.ph",
    ];
    return dlsuDomains.some((domain) => email.toLowerCase().endsWith(domain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateDLSUEmail(email)) {
      setError(
        "We're currently not accepting non-DLSU students, but we're open to partnering with your school if you can serve as our campus ambassador to help us gather the necessary data and paperwork. Contact us at hello@betterinternship.com."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Production flow with OTP
      await emailStatus(email).then((response) => {
        if (!response?.existing_user) {
          router.push(`/register?email=${encodeURIComponent(email)}`);
          setLoading(false);
        } else if (!response.verified_user) {
          router.push(`/login?verified=pending`);
        } else {
          router.push(`/login/otp?email=${encodeURIComponent(email)}`);
        }
      });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    } finally {
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  return (
    <>
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full">
          {/* Welcome Message */}
          <div className="text-center mb-10">
            <h2 className="text-5xl font-heading font-bold text-gray-900 mb-2">
              Recruiters are waiting!
            </h2>
          </div>

          <div className="max-w-md m-auto">
            {/* Verification Message - Only show if coming from registration */}
            {showVerificationMessage && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 text-center font-medium">
                  📧 Please check your Inbox for a Verification Email!
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Input
                  type="email"
                  placeholder="School Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear any existing errors when user types
                    if (error) setError("");
                  }}
                  onKeyPress={handleKeyPress}
                  required
                  className="w-full h-12 px-4 input-box hover:cursor-text focus:ring-0"
                  disabled={loading}
                />
              </div>
            </form>
            <Button
              onClick={handleSubmit}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white transition-colors cursor-pointer mt-4"
            >
              {loading ? "Checking..." : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
