"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@/lib/api/api-origin";

/** Small, shared avatar query: no app services/search imports on public entry. */
export function useNavigationAvatar(accountId: string | undefined) {
  const desktop = useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia("(min-width: 768px)");
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["student-navigation-avatar", accountId],
    enabled: !!accountId && desktop,
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch(apiUrl("/api/users/me/pic"), {
        credentials: "include",
        signal,
      });
      if (!response.ok) return null;
      const data = (await response.json()) as {
        hash?: string;
        empty?: boolean;
      };
      return data.hash && !data.empty
        ? apiUrl(`/api/users/me/pic?hash=${encodeURIComponent(data.hash)}`)
        : null;
    },
  });
  useEffect(() => {
    const refresh = () => {
      void client.invalidateQueries({
        queryKey: ["student-navigation-avatar", accountId],
      });
    };
    window.addEventListener("bi:pfp-updated", refresh);
    return () => window.removeEventListener("bi:pfp-updated", refresh);
  }, [accountId, client]);
  return accountId ? query.data : null;
}
