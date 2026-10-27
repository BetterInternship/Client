"use client";

import { useState } from "react";
import { useAuthContext } from "@/app/hire/authctx";
import { usePfpUrl } from "@/hooks/use-pfp";

/** Shared logo choice for the inline creator and share sheet. */
export function usePubmatLogo(initialLogo?: string | null) {
  const { user } = useAuthContext();
  const hasInitialLogo = initialLogo !== undefined;
  const profile = usePfpUrl({
    id: "me",
    source: "employer",
    enabled: !hasInitialLogo && !!user,
  });
  // undefined means use the profile; null explicitly continues without a logo.
  const [choice, setChoice] = useState<string | null>();
  const [asking, setAsking] = useState(false);
  const resolvedLogo = hasInitialLogo ? initialLogo : profile.url;

  return {
    loading: choice === undefined && !hasInitialLogo && profile.loading,
    needsLogo:
      choice === undefined &&
      !hasInitialLogo &&
      !profile.loading &&
      !profile.url,
    companyLogo: choice === undefined ? resolvedLogo || undefined : choice,
    asking,
    ask: () => setAsking(true),
    continueWith: (logo: string | null) => {
      setChoice(logo);
      setAsking(false);
    },
  };
}
