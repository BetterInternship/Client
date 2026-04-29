import { AuthService } from "@/lib/api/services";
import { useProfileData } from "@/lib/api/student.data.api";
import { FormInput } from "@/components/EditForm";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [sending, setSending] = useState(false);
  const [eduEmail, setEduEmail] = useState(
    profile.data?.edu_verification_email ?? "",
  );
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [error, setError] = useState("");

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

  const requestOTP = () => {
    if (!isEmailValid || sending) return;
    setSending(true);
    setError("");

    AuthService.requestActivation(eduEmail)
      .then((response) => {
        if (response?.success !== true) {
          console.log("OTP request failed:", response);
          const err =
            response?.message?.trim() ||
            response?.error?.trim() ||
            "Couldn't send OTP. Try again.";
          setError(err);
          return;
        }
        toast.success("OTP sent. Check your inbox for the six-digit code.");
        onNextAction(eduEmail);
      })
      .catch(() => setError("Couldn't send OTP. Try again."))
      .finally(() => setSending(false));
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
            setter={setEduEmail}
            placeholder="student@school.edu.ph"
          />
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
          onClick={requestOTP}
          disabled={!isEmailValid || sending}
        >
          {sending ? "Sending..." : "Send OTP"}
        </Button>
      </div>
    </>
  );
}
