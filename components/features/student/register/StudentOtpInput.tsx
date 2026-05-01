import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { STUDENT_OTP_LENGTH } from "@/hooks/use-student-otp-verification";

type StudentOtpInputProps = {
  containerClassName?: string;
  onChange: (value: string) => void;
  value: string;
};

export function StudentOtpInput({
  containerClassName = "justify-center",
  onChange,
  value,
}: StudentOtpInputProps) {
  return (
    <InputOTP
      maxLength={STUDENT_OTP_LENGTH}
      value={value}
      onChange={onChange}
      containerClassName={containerClassName}
    >
      <InputOTPGroup>
        {Array.from({ length: STUDENT_OTP_LENGTH }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
