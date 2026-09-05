/**
 * @ Author: BetterInternship
 * @ Description:
 *
 * Resolves a profile picture into a URL the browser can actually render.
 */

"use client";

import { useCallback, useEffect } from "react";
import { useFile } from "@/hooks/use-file";
import { EmployerService, UserService } from "@/lib/api/services";

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
  const fetcher = useCallback(
    async () =>
      source === "employer"
        ? EmployerService.getEmployerPfpURL(id)
        : UserService.getUserPfpURL(id),
    [id, source],
  );

  const { url, loading, sync } = useFile({
    route: `/${source}/${id}/pic`,
    fetcher,
    defaultURL,
  });

  useEffect(() => {
    if (!enabled) return;
    void sync();
  }, [enabled, sync]);

  useEffect(() => {
    if (!enabled) return;
    const handlePfpUpdated = () => void sync();

    window.addEventListener(PFP_UPDATED_EVENT, handlePfpUpdated);
    return () => {
      window.removeEventListener(PFP_UPDATED_EVENT, handlePfpUpdated);
    };
  }, [enabled, sync]);

  // useFile parks `loading` at true until a sync lands, which never comes when
  // disabled — report "settled" instead of a spinner that would hang forever.
  return { url, loading: enabled ? loading : false };
};
