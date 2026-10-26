"use client";

import { useState } from "react";
import { useAuthContext } from "@/app/hire/authctx";
import { usePfpUrl } from "@/hooks/use-pfp";

/** Shared logo choice for the inline creator and share sheet. */
export function usePubmatLogo() {
  const { user } = useAuthContext();
  const profile = usePfpUrl({
    id: "me",
    source: "employer",
    enabled: !!user,
  });
  // undefined means use the profile; null explicitly continues without a logo.
  const [choice, setChoice] = useState<string | null>();
  const [asking, setAsking] = useState(false);

  return {
    loading: choice === undefined && profile.loading,
    needsLogo: choice === undefined && !profile.loading && !profile.url,
    companyLogo: choice === undefined ? profile.url || undefined : choice,
    asking,
    ask: () => setAsking(true),
    continueWith: (logo: string | null) => {
      setChoice(logo);
      setAsking(false);
    },
  };
}
