"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/lib/ctx-auth";
import { MultipartFormBuilder } from "@/lib/multipart-form";
import { NotAccepted } from "@/lib/images";
import { motion, AnimatePresence } from "framer-motion";


export default function LoginPage() {
  const { emailStatus, register, redirectIfLoggedIn } = useAuthContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false); // Added for smoother error transition
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
      setImageLoaded(false); // Reset image loading when submitting again

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

            {/* Preload image invisibly for smoother error div */}
            {error && !imageLoaded && (
              <img
                src={NotAccepted.src}
                alt=""
                className="hidden"
                onLoad={() => setImageLoaded(true)}
              />
            )}

            {/* Error Message */}
            {<AnimatePresence>
                {error && imageLoaded && (
                    <motion.div
                    key="error-box"
                    initial={{ opacity: 0, scale: 0.97, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -6 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6 flex flex-col items-center text-center p-4 bg-red-50 border rounded-xl error-box"
                    >
                    <img
                        src={NotAccepted.src}
                        alt="Not accepted illustration"
                        className="w-44 h-43 mx-auto mb-4 bounce-slow"
                    />
                    <p className="text-sm text-red-600 font-medium text-justify">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>  }


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

      <style jsx>{`
        .fade-slide-in {
          animation: fadeSlideIn 0.5s cubic-bezier(0.33, 1, 0.68, 1) both;
        }

        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bounce-slow {
          animation: bounce 2s infinite ease-in-out;
          transform-origin: bottom center;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .error-box {
          animation: borderPulse 3s infinite ease-in-out;
          border-width: 1.5px;
        }

        @keyframes borderPulse {
          0%, 100% {
            border-color: rgba(248, 113, 113, 0.3); /* red-400 */
          }
          50% {
            border-color: rgba(248, 113, 113, 0.7);
          }
        }
      `}</style>
    </>
  );
}
