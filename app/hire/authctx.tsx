"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Employer, EmployerSelf } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { AuthResponse, EmployerAuthService } from "@/lib/api/hire.api";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

type AuthUser = Partial<EmployerSelf> & { god?: boolean };

interface IAuthContext {
  user: AuthUser | null;
  /**
   * A god is signed in as this account from the tools site. Read from the
   * server on every load, so a reload never forgets it (TOOLS_SITE_PLAN.md T16).
   */
  impersonating: boolean;
  loading: boolean;
  register: (employer: Partial<Employer> | FormData) => Promise<AuthResponse>;
  requestLoginOtp: (email: string) => Promise<AuthResponse>;
  verifyLoginOtp: (email: string, otp: string) => Promise<AuthResponse>;
  /** Ends the impersonation and returns to the tools site. */
  stopImpersonating: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  refreshAuthentication: () => Promise<AuthUser | null>;
  redirectIfNotLoggedIn: () => void;
  redirectIfLoggedIn: () => void;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

const TOOLS_CLIENT_URL = (
  process.env.NEXT_PUBLIC_TOOLS_CLIENT_URL ?? ""
).replace(/\/$/, "");

export const useAuthContext = () => useContext(AuthContext);

/**
 * The component that provides the Auth API to its children
 *
 * @component
 */
export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [impersonating, setImpersonating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const user = sessionStorage.getItem("user");
    return user ? (JSON.parse(user) as AuthUser) : null;
  });

  // Whenever user is updated, cache in localStorage
  useEffect(() => {
    if (user) sessionStorage.setItem("user", JSON.stringify(user));
    else sessionStorage.removeItem("user");

    if (isAuthenticated)
      sessionStorage.setItem("isAuthenticated", JSON.stringify(true));
    else sessionStorage.removeItem("isAuthenticated");
  }, [user, isAuthenticated]);

  const refreshAuthentication = async (): Promise<AuthUser | null> => {
    // /hire/loggedin, not /employer-users/me — this is the one call that
    // must survive a full page load and still know who is signed in, and
    // whether a god is signed in as them. The persisted React Query
    // cache spans 24h across full page
    // loads, so every query key below must be invalidated here — skipping
    // one is exactly how stale identity/team data survives a login.
    const response = await EmployerAuthService.loggedIn();

    if (!response.success || !response.user) {
      setIsAuthenticated(false);
      setImpersonating(false);
      setUser(null);
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("user");
      setLoading(false);
      return null;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] }),
      queryClient.invalidateQueries({ queryKey: ["me"] }),
      queryClient.invalidateQueries({ queryKey: ["my-employer-team"] }),
    ]);

    setUser(response.user);
    setImpersonating(!!response.impersonated);

    setIsAuthenticated(true);
    setLoading(false);
    return response.user;
  };

  const register = async (employer: Partial<Employer> | FormData) => {
    const response = await EmployerAuthService.register(employer);
    return response;
  };

  const requestLoginOtp = async (email: string) => {
    return EmployerAuthService.requestLoginOtp(email);
  };

  const verifyLoginOtp = async (email: string, otp: string) => {
    const response = await EmployerAuthService.verifyLoginOtp(email, otp);
    if (!response.success || !response.user) return response;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] }),
      queryClient.invalidateQueries({ queryKey: ["me"] }),
      queryClient.invalidateQueries({ queryKey: ["my-employer-team"] }),
    ]);

    setUser(response.user);
    setImpersonating(false);
    setIsAuthenticated(true);

    return response;
  };

  // The impersonation banner's "Stop": the hire logout ends the employer
  // session (and logs impersonation_ended), then the god goes back to the
  // tools site, where their own session is untouched.
  const stopImpersonating = async () => {
    await EmployerAuthService.logout();
    queryClient.clear();
    setUser(null);
    setImpersonating(false);
    setIsAuthenticated(false);
    window.location.assign(`${TOOLS_CLIENT_URL}/employers`);
  };

  const logout = async () => {
    await EmployerAuthService.logout();
    queryClient.clear();
    router.push("/login");
    setUser(null);
    setImpersonating(false);
    setIsAuthenticated(false);
  };

  const redirectIfNotLoggedIn = () =>
    useEffect(() => {
      if (!loading && !isAuthenticated) router.push("/login");
    }, [isAuthenticated, loading]);

  const redirectIfLoggedIn = () => {
    const effectRan = useRef(false);

    useEffect(() => {
      if (effectRan.current && !loading && isAuthenticated) {
        router.push("/dashboard");
      }

      if (!loading) {
        effectRan.current = true;
      }
    }, [isAuthenticated, loading]);
  };

  useEffect(() => {
    void refreshAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        impersonating,
        register,
        requestLoginOtp,
        verifyLoginOtp,
        stopImpersonating,
        loading,
        logout,
        refreshAuthentication,
        isAuthenticated: () => isAuthenticated,
        redirectIfNotLoggedIn,
        redirectIfLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
