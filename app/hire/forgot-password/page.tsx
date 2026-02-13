"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { EmployerUserService } from "@/lib/api/services";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { HelpCircle } from "lucide-react";

/**
 * Display the layout for the forgot password page.
 */
export default function ForgotPasswordPage() {
  const { isMobile } = useAppContext();

  return (
    <div className={cn(
      "flex justify-center py-12 pt-12 h-full overflow-y-auto",
      isMobile
        ? "px-2"
        : "px-6"
    )}>
      <div className="flex justify-center w-full max-w-2xl h-fit">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

/**
 * Layout for the forgot password form.
 */
const ForgotPasswordForm = ({}) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // send password reset request if a valid email is entered.
  const handle_request = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const r = await EmployerUserService.requestPasswordReset(email);

      // @ts-ignore
      setMessage(r.message);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
          animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full"
        >
          <Card className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={HelpCircle} />
            <HeaderText>Reset password</HeaderText>
          </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 justify-center">{error}</p>
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 justify-center">{message}</p>
              </div>
            )}
            <FormInput
              label="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <div className="flex justify-between items-center w-[100%]">
              <span className="text-sm text-gray-500">
                Remember your password? <a className="text-blue-600 hover:text-blue-800 underline font-medium" href="/login">Log in here.</a>
              </span>
              <Button
                type="submit"
                onClick={handle_request}
                disabled={isLoading}
              >
                {isLoading ? "Sending request..." : "Request password reset"}
              </Button>
            </div>
            <span className="text-muted-foreground text-sm">
              Need help? Contact us at <a href="tel://09276604999" className="text-blue-600 hover:text-blue-800 underline font-medium">0927 660 4999</a> or on <a href="viber://add?number=639276604999" className="text-blue-600 hover:text-blue-800 underline font-medium">Viber</a>.
            </span>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  )
};