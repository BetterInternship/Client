"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useAuthContext } from "../authctx";

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
  const [step, setStep] = useState<"email" | "password">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  redirect_if_not_logged_in();
  redirect_if_logged_in();

  const normalize = (s: string) => s.trim().toLowerCase();

  const handle_email_submit = async (e: React.FormEvent) => {
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
      const r = await email_status(normalized);
      if (!r?.success) {
        setIsLoading(false);
        alert(r?.message ?? "Unknown error");
        return;
      }

      if (!r.existing_user) {
        setIsLoading(false);
        set_new_account(true);
        return;
      }

      setIsLoading(false);
      setStep("password");
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message ?? "Something went wrong.");
    }
  };

  const handle_password_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Use the normalized value if we have it; else normalize on the fly
    const normalized = emailNorm || normalize(email);

    try {
      const r = await login(normalized, password); // ✅ login with normalized
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
      setError(err?.message ?? "Something went wrong.");
      setIsLoading(false);
    }
  };

  const handle_back_to_email = () => {
    setStep("email");
    setPassword("");
    setError("");
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 h-[80vh]">
      <div className="w-full">
        {/* Back Arrow for OTP step */}
        {step === "password" && (
          <div className="mb-6">
            <button
              onClick={handle_back_to_email}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Welcome Message */}
        <div className="text-center mb-10">
          {step === "email" ? (
            !new_account ? (
              <h2 className="text-5xl font-heading font-bold text-gray-900 mb-2">
                Future interns are waiting!
              </h2>
            ) : (
              <>
                <h2 className="text-5xl font-heading font-bold text-gray-900 mb-2">
                  First time here?
                </h2>
                <p className="">Don't miss out, sign up with us now!</p>
              </>
            )
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Enter Password
              </h2>
            </div>
          )}
        </div>

        <div className="max-w-md m-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 justify-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          {step === "email" ? (
            <form onSubmit={handle_email_submit} className="space-y-6">
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 input-box hover:cursor-text focus:ring-0"
                />
              </div>

              {!new_account ? (
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying email..." : "Continue"}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => router.push("/register")}
                >
                  {isLoading ? "Loading..." : "Set Up Account"}
                </Button>
              )}
            </form>
          ) : (
            <form onSubmit={handle_password_submit} className="space-y-6">
              {/* OTP Input Boxes */}
              <Input
                type="password"
                className="w-full h-12 input-box hover:cursor-text"
                placeholder="Password..."
                onChange={(e) => setPassword(e.target.value)}
              ></Input>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
