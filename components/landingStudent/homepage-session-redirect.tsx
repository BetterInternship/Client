"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readSessionHint } from "@/lib/session-hint";

/** Sends signed-in students from the homepage to search.
 * The homepage is a cached static page rendered outside the student app shell,
 * so neither a server-side cookie check nor the auth context is available here.
 * Only browsers carrying the session hint ask the API, so logged-out visitors
 * make no request and don't download the API client. */
export function HomepageSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!readSessionHint()) return;
    let cancelled = false;
    void import("@/lib/api/services").then(async ({ UserService }) => {
      const response = await UserService.getMyProfile();
      if (!cancelled && response?.success && response.user)
        router.replace("/search");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
