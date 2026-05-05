"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/lib/api/services";

type OtpResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

type OtpResult = {
  success: boolean;
  message?: string;
  response?: OtpResponse;
};

type OtpOptions = {
  failureMessage?: string;
  networkErrorMessage?: string;
};

type RequestOtpOptions = OtpOptions & {
  startCooldown?: boolean;
};

type UseStudentOtpVerificationOptions = {
  email?: string;
  autoActivate?: {
    enabled?: boolean;
    failureMessage?: string;
    networkErrorMessage?: string;
    onSuccess: (result: OtpResult) => void;
  };
  cooldownSeconds?: number;
  initialCoolingDown?: boolean;
};

export const STUDENT_OTP_LENGTH = 6;
const DEFAULT_COOLDOWN_SECONDS = 60;

const getResponseError = (
  response: OtpResponse | undefined,
  fallback: string,
) => response?.message?.trim() || response?.error?.trim() || fallback;

export function useStudentOtpVerification({
  email,
  autoActivate,
  cooldownSeconds = DEFAULT_COOLDOWN_SECONDS,
  initialCoolingDown = false,
}: UseStudentOtpVerificationOptions = {}) {
  const queryClient = useQueryClient();
  const sendingRef = useRef(false);
  const activatingRef = useRef(false);
  const autoActivationAttemptRef = useRef("");

  const [otp, setOtpState] = useState("");
  const [sending, setSending] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [isCoolingDown, setIsCoolingDown] = useState(initialCoolingDown);
  const [countdown, setCountdown] = useState(
    initialCoolingDown ? cooldownSeconds : 0,
  );

  const prevEmailRef = useRef(email);
  useEffect(() => {
    if (email !== prevEmailRef.current) {
      setError("");
      prevEmailRef.current = email;
    }
  }, [email]);

  useEffect(() => {
    if (!isCoolingDown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    setIsCoolingDown(false);
  }, [countdown, isCoolingDown]);

  const setOtp = useCallback((value: string) => {
    autoActivationAttemptRef.current = "";
    setError("");
    setOtpState(value);
  }, []);

  const startCooldown = useCallback(
    (seconds = cooldownSeconds) => {
      setIsCoolingDown(true);
      setCountdown(seconds);
    },
    [cooldownSeconds],
  );

  const requestOtp = useCallback(
    async ({
      failureMessage = "Couldn't send verification code. Try again.",
      networkErrorMessage = failureMessage,
      startCooldown: shouldStartCooldown = true,
    }: RequestOtpOptions = {}): Promise<OtpResult | null> => {
      if (!email || sendingRef.current || isCoolingDown) return null;

      sendingRef.current = true;
      setSending(true);
      setError("");

      try {
        const response = await AuthService.requestActivation(email);

        if (response?.success !== true) {
          const message = getResponseError(response, failureMessage);
          setError(message);
          return { success: false, message, response };
        }

        if (shouldStartCooldown) startCooldown();
        return { success: true, response };
      } catch {
        setError(networkErrorMessage);
        return { success: false, message: networkErrorMessage };
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [email, isCoolingDown, startCooldown],
  );

  const activateOtp = useCallback(
    async (
      otp: string,
      {
        failureMessage = "Verification code not valid.",
        networkErrorMessage = "Couldn't verify your code. Try again.",
      }: OtpOptions = {},
    ): Promise<OtpResult | null> => {
      if (!email || activatingRef.current) return null;

      activatingRef.current = true;
      setActivating(true);
      setError("");

      try {
        const response = await AuthService.activate(email, otp);
        await queryClient.invalidateQueries({ queryKey: ["my-profile"] });

        if (response?.success === true) {
          return { success: true, response };
        }

        const message = getResponseError(response, failureMessage);
        setError(message);
        return { success: false, message, response };
      } catch {
        setError(networkErrorMessage);
        return { success: false, message: networkErrorMessage };
      } finally {
        activatingRef.current = false;
        setActivating(false);
      }
    },
    [email, queryClient],
  );

  const autoActivateEnabled = autoActivate?.enabled ?? true;
  const autoActivateFailureMessage = autoActivate?.failureMessage;
  const autoActivateNetworkErrorMessage = autoActivate?.networkErrorMessage;
  const autoActivateOnSuccess = autoActivate?.onSuccess;

  useEffect(() => {
    if (!autoActivateEnabled || !email || !autoActivateOnSuccess) return;
    if (otp.length !== STUDENT_OTP_LENGTH) return;

    const attemptKey = `${email}:${otp}`;
    if (autoActivationAttemptRef.current === attemptKey) return;
    autoActivationAttemptRef.current = attemptKey;

    void (async () => {
      const result = await activateOtp(otp, {
        failureMessage: autoActivateFailureMessage,
        networkErrorMessage: autoActivateNetworkErrorMessage,
      });
      if (result?.success === true) autoActivateOnSuccess(result);
    })();
  }, [
    activateOtp,
    email,
    autoActivateEnabled,
    autoActivateFailureMessage,
    autoActivateNetworkErrorMessage,
    autoActivateOnSuccess,
    otp,
  ]);

  return {
    activating,
    countdown,
    error,
    isCoolingDown,
    otpInputProps: {
      onChange: setOtp,
      value: otp,
    },
    requestOtp,
    sending,
  };
}
