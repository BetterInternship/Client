import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthService } from "@/lib/api/services";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * The third step to registering where the user inputs the verification code sent to their email.
 * @param eduEmail The user's education email that the verification code was sent to.
 * @param onFinishAction A function to run when clicking the finish button.
 * @param onBackAction A function to run when clicking the back button.
 * @returns Form forentering the verification code.
 */
export function OTPEnterStep({
  eduEmail,
  onFinishAction,
  onBackAction,
}: {
  eduEmail: string;
  onFinishAction: () => void;
  onBackAction: () => void;
}) {
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [activating, setActivating] = useState(false);
  const activatingRef = useRef(false);

  // resend state
  const [sending, setSending] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(true);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isCoolingDown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isCoolingDown) {
      setIsCoolingDown(false);
    }
  }, [countdown, isCoolingDown]);

  // auto-activate when six digits are entered.
  useEffect(() => {
    if (otp.length !== 6 || activatingRef.current) return;

    activatingRef.current = true;
    setActivating(true);
    setOtpError("");

    AuthService.activate(eduEmail, otp)
      .then(async (response) => {
        await queryClient.invalidateQueries({
          queryKey: ["my-profile"],
        });

        if (response?.success === true) {
          onFinishAction();
        } else {
          setOtpError(
            response?.message?.trim() ||
              response?.error?.trim() ||
              "Verification code not valid.",
          );

          activatingRef.current = false;
        }
      })
      .catch(() => {
        setOtpError("Couldn't verify your code. Try again.");
        activatingRef.current = false;
      })
      .finally(() => setActivating(false));
  }, [otp, eduEmail, onFinishAction, queryClient]);

  // connect to the authentication service to request the otp.
  const requestOTP = () => {
    // check if the otp can be requested before doing anything.
    if (sending || isCoolingDown) return;
    setSending(true);
    setOtpError("");

    AuthService.requestActivation(eduEmail)
      .then((response) => {
        if (response?.success !== true) {
          setOtpError(
            response?.message?.trim() ||
              response?.error?.trim() ||
              "Couldn't send verification code. Try again.",
          );
          return;
        }
        toast.success(
          "Verification code sent. Check your inbox for the six-digit code.",
        );
        setIsCoolingDown(true);
        setCountdown(60);
      })
      .catch(() => setOtpError("Couldn't send verification code. Try again."))
      .finally(() => setSending(false));
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl tracking-tight font-bold text-gray-700">
          Enter verification code
        </h1>
        <span className="text-muted-foreground tracking-tight text-sm">
          We sent a 6-digit code to <strong>{eduEmail}</strong>.
        </span>
        <div className="rounded-[0.5em] border border-primary/20 p-4 space-y-3">
          <div className="text-sm font-medium text-gray-700 text-center">
            Enter the 6-digit code sent to your email
          </div>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            containerClassName="justify-center"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={onBackAction}
            disabled={sending || isCoolingDown}
            className="w-full sm:w-auto"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={requestOTP}
            disabled={sending || isCoolingDown}
            className="w-full sm:w-auto"
          >
            {sending
              ? "Sending..."
              : isCoolingDown
                ? `Resend in ${countdown}s`
                : "Resend code"}
          </Button>
        </div>
      </div>
    </>
  );
}
