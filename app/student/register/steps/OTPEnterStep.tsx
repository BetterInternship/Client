import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useStudentOtpVerification } from "@/hooks/use-student-otp-verification";
import { StudentOtpInput } from "@/components/features/student/register/StudentOtpInput";

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
  const {
    countdown,
    error: otpError,
    isCoolingDown,
    otpInputProps,
    requestOtp,
    sending,
  } = useStudentOtpVerification({
    email: eduEmail,
    autoActivate: {
      onSuccess: onFinishAction,
    },
    initialCoolingDown: true,
  });

  // connect to the authentication service to request the otp.
  const requestOTP = async () => {
    // check if the otp can be requested before doing anything.
    if (sending || isCoolingDown) return;

    const result = await requestOtp({
      failureMessage: "Couldn't send verification code. Try again.",
    });

    if (result?.success !== true) return;

    toast.success(
      "Verification code sent. Check your inbox for the six-digit code.",
    );
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
          <StudentOtpInput {...otpInputProps} />
        </div>

        {otpError && (
          <div className="flex items-center gap-2 rounded-[0.5em] border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{otpError}</span>
          </div>
        )}

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
            onClick={() => void requestOTP()}
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
