"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type UnlockStatus = "locked" | "unlocked";

type RegisterUnlockResponse = {
  success: boolean;
  message?: string;
};

type RegisterUnlockInput = {
  cfToken: string;
  email: string;
};

type UseSuperListingUnlockOptions = {
  isDevelopment?: boolean;
  slug: string;
};

const getApiBase = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export function useSuperListingUnlock({
  isDevelopment = false,
  slug,
}: UseSuperListingUnlockOptions) {
  const [status, setStatus] = useState<UnlockStatus>("locked");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const endpointBase = useMemo(() => {
    const apiBase = getApiBase();
    if (!apiBase) return `/api/super-listings/${slug}/unlock`;
    return `${apiBase}/super-listings/${slug}/unlock`;
  }, [slug]);

  const register = useCallback(
    async ({ cfToken, email }: RegisterUnlockInput) => {
      setMessage("");

      const response = await fetch(`${endpointBase}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          "cf-token": isDevelopment ? "dev-bypass" : cfToken,
        }),
      });
      const data = (await response.json()) as RegisterUnlockResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send your unlock link.");
      }

      return data;
    },
    [endpointBase, isDevelopment],
  );

  const unlock = useCallback((unlockedEmail?: string) => {
    setEmail(unlockedEmail?.trim() ?? "");
    setStatus("unlocked");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get("view");
    const unlockToken = searchParams.get("unlockToken");

    if (
      view === "challenge" ||
      (isDevelopment && unlockToken === "dev-unlock")
    ) {
      unlock();
      return;
    }

    setEmail("");
    setStatus("locked");
  }, [isDevelopment, unlock]);

  const lock = useCallback(() => {
    setEmail("");
    setStatus("locked");
  }, []);

  return {
    email,
    isChecking: false,
    isLocked: status !== "unlocked",
    lock,
    message,
    register,
    status,
    unlock,
  };
}
