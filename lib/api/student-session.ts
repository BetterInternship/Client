import type { PublicUser } from "@/lib/db/db.types";
import { apiUrl } from "./api-origin";
import { redirectIfMaintenanceMode } from "./maintenance";

/**
 * Calls the student profile and logout endpoints and checks their responses.
 * Keeps a confirmed logout separate from temporary failures, and defines the
 * session's query settings. AuthContextProvider manages the actual login state.
 *
 * The reason we use this instead of the generated hooks is because the session
 * requests need the real HTTP status, our generated API client does not expose that.
 * (for now perhaps)...
 */

export interface StudentSession {
  success: boolean;
  user: PublicUser | null;
  message?: string;
}

export async function fetchStudentSession(
  signal?: AbortSignal,
): Promise<StudentSession> {
  if (redirectIfMaintenanceMode())
    throw new Error("Application is in maintenance mode.");
  const response = await fetch(apiUrl("/api/users/me"), {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    signal,
    cache: "no-store",
  });
  if (response.status === 401) return { success: false, user: null };
  const data = (await response
    .json()
    .catch(() => null)) as StudentSession | null;
  if (!response.ok || !data?.success || !data.user?.id) {
    throw new Error(
      data?.message || "Your account is temporarily unavailable.",
    );
  }
  return data;
}

export async function endStudentSession(): Promise<void> {
  const response = await fetch(apiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  // A missing session already represents the desired signed-out state.
  if (response.status === 401) return;
  const data = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;
  if (!response.ok || (response.status !== 204 && data?.success !== true)) {
    throw new Error(data?.message || "Could not sign out. Please try again.");
  }
}

export const studentSessionOptions = {
  queryKey: ["my-profile"] as const,
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchStudentSession(signal),
  // Auth state must be revalidated after navigation; a cached user can survive
  // logout and incorrectly unlock protected pages.
  staleTime: 0,
  refetchOnMount: "always" as const,
  retry: false as const,
  refetchOnWindowFocus: true,
};
