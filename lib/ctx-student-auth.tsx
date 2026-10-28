"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { PublicUser } from "@/lib/db/db.types";
import type { FetchResponse } from "@/lib/api/use-fetch";
import {
  endStudentSession,
  fetchStudentSession,
  studentSessionOptions,
  type StudentSession,
} from "@/lib/api/student-session";
import { savePostLoginRedirect } from "@/lib/post-login-redirect";
import { googleLoginUrl } from "@/lib/api/urls";

/**
 * Keeps the student's login state shared across the site.
 * Uses student-session.ts to check the API, clears old data when accounts change,
 * and keeps other tabs in sync. Hire uses its own auth context.
 */

const AUTH_EVENT_KEY = "bi.student-auth-change";
export type StudentSessionStatus =
  | "checking"
  | "authenticated"
  | "anonymous"
  | "unavailable";

/** The login state and actions available to components using useAuthContext(). */
interface IAuthContext {
  register: (
    user: Partial<PublicUser>,
  ) => Promise<
    ({ user: Partial<PublicUser>; message?: string } & FetchResponse) | null
  >;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  refreshAuthentication: () => Promise<Partial<PublicUser> | null>;
  status: StudentSessionStatus;
  user: PublicUser | null;
  error: Error | null;
}

// Signed-out defaults. These do not make requests or start a student session.
const GUEST_AUTH: IAuthContext = {
  register: () => Promise.resolve(null),
  logout: async () => {},
  isAuthenticated: () => false,
  refreshAuthentication: () => Promise.resolve(null),
  status: "anonymous",
  user: null,
  error: null,
};
const AuthContext = createContext<IAuthContext>(GUEST_AUTH);
export const useAuthContext = () => useContext(AuthContext);

/** Tell other tabs to recheck their session after login or logout. */
export function broadcastStudentAuthChange() {
  try {
    localStorage.setItem(AUTH_EVENT_KEY, `${Date.now()}:${Math.random()}`);
  } catch {
    /* Cross-tab synchronization is best effort when storage is blocked. */
  }
}

/** Clear cached page data, but keep the session query that identifies the user. */
async function clearOtherQueries(client: QueryClient) {
  const filter = {
    predicate: (query: { queryKey: readonly unknown[] }) =>
      query.queryKey[0] !== "my-profile",
  };
  await client.cancelQueries(filter);
  client.removeQueries(filter);
}

/** Stop old query results from restoring a user after we reset the local session. */
async function resetSessionCache(client: QueryClient) {
  await client.cancelQueries({ queryKey: studentSessionOptions.queryKey });
  await clearOtherQueries(client);
  client.setQueryData<StudentSession>(studentSessionOptions.queryKey, {
    success: false,
    user: null,
  });
}

/** Listen for auth changes from other tabs; this tab updates itself directly. */
function useStudentAuthSync(refreshSession: () => Promise<void>) {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_EVENT_KEY || event.key === null) {
        void refreshSession();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshSession]);
}

/**
 * Gives child components the current student, session status, and auth actions.
 * The shared profile query is the source of truth, not a separate login flag.
 */
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [isChangingAccount, setIsChangingAccount] = useState(false);

  // 1. Check who is signed in. Clear old page data before exposing another account.
  const options = useMemo(
    () => ({
      ...studentSessionOptions,
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const result = await fetchStudentSession(signal);
        const previous = client.getQueryData<StudentSession>(
          studentSessionOptions.queryKey,
        );
        if (previous?.user?.id && previous.user.id !== result.user?.id) {
          // Retire old observers before publishing a different verified account.
          await clearOtherQueries(client);
        }
        return result;
      },
    }),
    [client],
  );
  const session = useQuery(options);
  // A failed check means unavailable, not confirmed logout.
  let status: StudentSessionStatus;
  if (isChangingAccount || session.isPending) status = "checking";
  else if (session.isError) status = "unavailable";
  else if (session.data?.user) status = "authenticated";
  else status = "anonymous";
  const user = status === "authenticated" ? (session.data?.user ?? null) : null;

  /** Ask the API again, even if the cached profile is still fresh. */
  const refreshAuthentication = useCallback(async () => {
    await client.invalidateQueries({
      queryKey: studentSessionOptions.queryKey,
      refetchType: "none",
    });
    const result = await client.fetchQuery(options);
    return result.user;
  }, [client, options]);

  // 2. Register or log out, then update this tab and notify the others.
  const register = async (input: Partial<PublicUser>) => {
    // Load the broader API services only when registering, not on every page visit.
    const { AuthService } = await import("@/lib/api/services");
    const response = await AuthService.register(input);
    if (response?.success) {
      await refreshAuthentication();
      broadcastStudentAuthChange();
    }
    return response;
  };

  const logout = async () => {
    // Keep the user signed in if the server cannot complete logout.
    await endStudentSession();
    setIsChangingAccount(true);
    try {
      await resetSessionCache(client);
      broadcastStudentAuthChange();
    } finally {
      setIsChangingAccount(false);
    }
  };

  // 3. Another tab changed accounts: hide the old user while checking the new session.
  const refreshFromAnotherTab = useCallback(async () => {
    setIsChangingAccount(true);
    try {
      await resetSessionCache(client);
      await refreshAuthentication();
    } catch {
      // The shared query exposes verification failures as unavailable.
    } finally {
      setIsChangingAccount(false);
    }
  }, [client, refreshAuthentication]);
  useStudentAuthSync(refreshFromAnotherTab);

  return (
    <AuthContext.Provider
      value={{
        register,
        logout,
        refreshAuthentication,
        isAuthenticated: () => status === "authenticated",
        status,
        user,
        error: session.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Send signed-out visitors to login, remembering the page they wanted to open. */
export function useRequireStudentSession() {
  const { status } = useAuthContext();
  const router = useRouter();
  useEffect(() => {
    if (status !== "anonymous") return;
    savePostLoginRedirect(
      `${window.location.pathname}${window.location.search}`,
    );
    router.push(googleLoginUrl());
  }, [status, router]);
}

/** Recruiter previews must never initialize a student session. */
export function GuestAuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthContext.Provider value={GUEST_AUTH}>{children}</AuthContext.Provider>
  );
}
