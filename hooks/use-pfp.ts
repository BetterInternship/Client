/**
 * @ Author: BetterInternship
 * @ Description:
 *
 * Resolves a profile picture into a URL the browser can actually render.
 */

"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmployerService, UserService } from "@/lib/api/services";
import { fileUrls } from "@/lib/api/urls";

/** Dispatched after a pfp upload so every mounted pfp re-syncs its hash. */
export const PFP_UPDATED_EVENT = "bi:pfp-updated";

export type PfpSource = "employer" | "users";

/**
 * Resolves a pfp to a renderable URL.
 *
 * The `/pic` endpoints are two-phase: an unhashed GET answers with the file's
 * hash (or `empty: true`), and only the hashed GET streams the bytes. The
 * `profile_picture` column is the GCS object key ("pfp-<id>"), not a URL.
 * Feeding it straight to an <img> renders as broken.
 *
 * Returns `defaultURL` (empty string unless overridden) while loading and when
 * the owner has never uploaded one, so callers can fall back on their own.
 *
 * @hook
 */
export const usePfpUrl = ({
  id,
  source,
  defaultURL = "",
  enabled = true,
}: {
  id: string;
  source: PfpSource;
  defaultURL?: string;
  enabled?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: ["profile-picture", source, id],
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    queryFn: async () => {
      const result = await (source === "employer"
        ? EmployerService.getEmployerPfpURL(id)
        : UserService.getUserPfpURL(id));
      const { success, empty, hash, url } = result as {
        success?: boolean;
        empty?: boolean;
        hash?: string;
        url?: string;
      };
      if (!success) throw new Error("Could not fetch profile picture.");
      if (empty) return "";
      if (url) return url;
      if (!hash) throw new Error("Profile picture response has no hash.");
      return source === "employer"
        ? fileUrls.employerLogo(hash, id)
        : fileUrls.userPfp(hash, id);
    },
  });

  useEffect(() => {
    if (!enabled) return;
    const handlePfpUpdated = () => {
      // Invalidate aliases such as "me" and the explicit owner id together.
      // Repeated listeners share the same in-flight request.
      void queryClient.invalidateQueries(
        { queryKey: ["profile-picture"], refetchType: "active" },
        { cancelRefetch: false },
      );
    };

    window.addEventListener(PFP_UPDATED_EVENT, handlePfpUpdated);
    return () => {
      window.removeEventListener(PFP_UPDATED_EVENT, handlePfpUpdated);
    };
  }, [enabled, queryClient]);

  return { url: data || defaultURL, loading: enabled && !!id && isPending };
};
