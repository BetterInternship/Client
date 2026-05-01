import { useProfileData } from "@/lib/api/student.data.api";
import { FormInput } from "@/components/EditForm";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStudentOtpVerification } from "@/hooks/use-student-otp-verification";

/**
 * The second step to registering where the user verifies their education email
 * to access forms. This step can be skipped during initial onboarding.
 * @param onNextAction Function that runs when the step is finished.
 * @param onSkipAction Function that runs when the step is skipped.
 * @returns Form for inputting the email to send the verification code to.
 */
export function OTPEmailStep({
  onNextAction,
  onSkipAction,
}: {
  onNextAction: (email: string) => void;
  onSkipAction: () => void;
}) {
  const profile = useProfileData();
  const [eduEmail, setEduEmail] = useState(
    profile.data?.edu_verification_email ?? "",
  );
  const [isEmailValid, setIsEmailValid] = useState(false);
  const { error, requestOtp, sending } = useStudentOtpVerification({
    email: eduEmail,
  });

  // set the education email if it doesn't exist on the user account.
  useEffect(() => {
    if (!eduEmail && profile.data?.edu_verification_email)
      setEduEmail(profile.data.edu_verification_email);
  }, [eduEmail, profile.data?.edu_verification_email]);

  // set the email validity flag when the value is changed.
  useEffect(() => {
    if (!eduEmail?.trim()) return setIsEmailValid(false);
    if (!eduEmail.endsWith(".edu.ph")) return setIsEmailValid(false);
    setIsEmailValid(true);
  }, [eduEmail]);

  const requestOTP = async () => {
    if (!isEmailValid || sending) return;

    const result = await requestOtp({
      failureMessage: "Couldn't send OTP. Try again.",
      startCooldown: false,
    });

    if (result?.success !== true) return;

    toast.success("OTP sent. Check your inbox for the six-digit code.");
    onNextAction(eduEmail);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl tracking-tight font-bold text-gray-700">
          Verify your account
        </h1>
        <span className="text-muted-foreground tracking-tight text-sm">
          To access online form signing, you'll need to verify your education
          email. If you don't, you'll still be able to apply to jobs on the
          site.
        </span>
      </div>
      <div className="flex flex-col gap-3 items-end mt-4">
        <div className="w-full">
          <FormInput
            label="Education email"
            value={eduEmail}
            maxLength={40}
            setter={(value) => {
              setEduEmail(value);
            }}
            placeholder="student@school.edu.ph"
          />
          {error && (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end items-center">
        <Button
          className="w-full sm:w-auto"
          variant="outline"
          type="button"
          onClick={onSkipAction}
        >
          Skip for now
        </Button>
        <Button
          type="button"
          onClick={() => void requestOTP()}
          disabled={!isEmailValid || sending}
        >
          {sending ? "Sending..." : "Send OTP"}
        </Button>
      </div>
    </>
  );
}
