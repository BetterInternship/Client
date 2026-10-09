"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Employer, EmployerSelf } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import {
  AuthResponse,
  BaseResponse,
  EmployerAuthService,
  GodAuthService,
  GodLoginResponse,
  GodSelf,
} from "@/lib/api/hire.api";
import { getFullName } from "@/lib/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

type AuthUser = Partial<EmployerSelf> & { god?: boolean };

interface IAuthContext {
  user: AuthUser | null;
  /** The signed-in god (their own session, apart from any employer one). */
  god: GodSelf | null;
  /** True until the first god session check has come back. */
  godLoading: boolean;
  proxy: string;
  loading: boolean;
  register: (employer: Partial<Employer> | FormData) => Promise<AuthResponse>;
  requestLoginOtp: (email: string) => Promise<AuthResponse>;
  verifyLoginOtp: (email: string, otp: string) => Promise<AuthResponse>;
  requestGodLoginOtp: (email: string) => Promise<BaseResponse>;
  verifyGodLoginOtp: (email: string, otp: string) => Promise<GodLoginResponse>;
  loginAs: (employer_id: string) => Promise<AuthUser | null>;
  exitProxy: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  refreshAuthentication: () => Promise<AuthUser | null>;
  redirectIfNotLoggedIn: () => void;
  redirectIfLoggedIn: () => void;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

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
  const [proxy, setProxy] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const [god, setGod] = useState<GodSelf | null>(null);
  const [godLoading, setGodLoading] = useState(true);
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
    // must survive a full page load and still know who is signed in. (Gods
    // are a separate session; see refreshGod.) The persisted React Query
    // cache spans 24h across full page
    // loads, so every query key below must be invalidated here — skipping
    // one is exactly how stale identity/team data survives a login.
    const response = await EmployerAuthService.loggedIn();

    if (!response.success || !response.user) {
      setIsAuthenticated(false);
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

    setIsAuthenticated(true);
    setLoading(false);
    return response.user;
  };

  // Asks the server whether there is a live god session. The god cookie is
  // separate from the employer one, so this runs on every load, alongside
  // refreshAuthentication, and never depends on it.
  const refreshGod = async (): Promise<GodSelf | null> => {
    try {
      const response = await GodAuthService.loggedIn();
      const self = response.success && response.god ? response.god : null;
      setGod(self);
      return self;
    } catch {
      setGod(null);
      return null;
    } finally {
      setGodLoading(false);
    }
  };

  const requestGodLoginOtp = (email: string) =>
    GodAuthService.requestOtp(email);

  const verifyGodLoginOtp = async (email: string, otp: string) => {
    const response = await GodAuthService.verifyOtp(email, otp);
    if (response.success && response.god) setGod(response.god);
    return response;
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
    setIsAuthenticated(true);

    return response;
  };

  const loginAs = async (employer_id: string) => {
    const response = await EmployerAuthService.loginAsEmployer(employer_id);
    if (!response.success) {
      alert("Error logging in by proxy.");
      return null;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] }),
      queryClient.invalidateQueries({ queryKey: ["me"] }),
      queryClient.invalidateQueries({ queryKey: ["my-employer-team"] }),
    ]);
    setProxy(getFullName(response.user));
    setUser(response.user ?? null);
    // A god has no employer account of their own, so this is what makes the
    // employer pages treat the proxied session as signed in.
    setIsAuthenticated(true);
    return response.user ?? null;
  };

  const exitProxy = async () => {
    const response = await EmployerAuthService.exitProxy();
    if (!response.success) {
      alert("Error leaving the employer account.");
      return false;
    }

    // Only the employer cookie is dropped; the god's own session stays, so
    // there is no account to restore. Forget the proxied employer entirely.
    for (const queryKey of [
      ["my-employer-profile"],
      ["me"],
      ["my-employer-team"],
    ])
      queryClient.removeQueries({ queryKey });
    setProxy("");
    setUser(null);
    setIsAuthenticated(false);
    return true;
  };

  const logout = async () => {
    await EmployerAuthService.logout();
    // Signing out of the portal ends a god session too; the two cookies are
    // independent on the server.
    const wasGod = god !== null;
    if (wasGod) await GodAuthService.logout();
    queryClient.clear();
    router.push(wasGod ? "/god-login" : "/login");
    setUser(null);
    setGod(null);
    setProxy("");
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
    void refreshGod();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        god,
        godLoading,
        proxy,
        register,
        requestLoginOtp,
        verifyLoginOtp,
        requestGodLoginOtp,
        verifyGodLoginOtp,
        loginAs,
        exitProxy,
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
