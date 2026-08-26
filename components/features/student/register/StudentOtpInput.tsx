import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { OTP_LENGTH } from "@/hooks/use-otp-verification";

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
      maxLength={OTP_LENGTH}
      autoComplete="one-time-code"
      value={value}
      onChange={onChange}
      containerClassName={containerClassName}
    >
      <InputOTPGroup>
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
