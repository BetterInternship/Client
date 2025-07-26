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
  const [password, setPassword] = useState("");
  const [new_account, set_new_account] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  redirect_if_not_logged_in();
  redirect_if_logged_in();

  const handle_email_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (email.trim() === "") {
      setIsLoading(false);
      setError("Email is required.");
      return;
    }

    await email_status(email).then(async (r) => {
      if (!r.existing_user) {
        setIsLoading(false);
        set_new_account(true);
        return;
      }

      // @ts-ignore
      if (!r.success) {
        setIsLoading(false);
        // @ts-ignore
        alert(r.message);
        return;
      }

      setIsLoading(false);
      setStep("password");
    });
  };

  const handle_password_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    await login(email, password).then((r) => {
      // @ts-ignore
      if (r?.success) {
        // @ts-ignore
        if (r.god) {
          router.push("/god");
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Invalid password.");
        setIsLoading(false);
      }
    });
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
