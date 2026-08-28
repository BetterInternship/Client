"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Employer, EmployerSelf } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { AuthResponse, EmployerAuthService } from "@/lib/api/hire.api";
import { getFullName } from "@/lib/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

type AuthUser = Partial<EmployerSelf> & { god?: boolean };

interface IAuthContext {
  user: AuthUser | null;
  god: boolean;
  proxy: string;
  loading: boolean;
  register: (employer: Partial<Employer> | FormData) => Promise<AuthResponse>;
  requestLoginOtp: (email: string) => Promise<AuthResponse>;
  verifyLoginOtp: (email: string, otp: string) => Promise<AuthResponse>;
  loginAs: (employer_id: string) => Promise<AuthUser | null>;
  exitProxy: () => Promise<AuthUser | null>;
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
  const [god, setGod] = useState(false);
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
    // must survive a full page load and still know both who is signed in
    // and whether they're a god (merged onto the user object itself, plan
    // §6.2). The persisted React Query cache spans 24h across full page
    // loads, so every query key below must be invalidated here — skipping
    // one is exactly how stale identity/team data survives a login.
    const response = await EmployerAuthService.loggedIn();

    if (!response.success || !response.user) {
      setIsAuthenticated(false);
      setUser(null);
      setGod(false);
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
    if (response.user.god) setGod(true);

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
      queryClient.invalidateQueries({
        queryKey: ["my-employer-conversations"],
      }),
      queryClient.invalidateQueries({ queryKey: ["me"] }),
      queryClient.invalidateQueries({ queryKey: ["my-employer-team"] }),
    ]);

    setUser(response.user);
    setIsAuthenticated(true);

    if (response.user.god) setGod(true);

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
    setUser(response.user);
    return response.user;
  };

  const exitProxy = async () => {
    const response = await EmployerAuthService.exitProxy();
    if (!response.success) {
      alert("Error returning to your own account.");
      return null;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] }),
      queryClient.invalidateQueries({ queryKey: ["me"] }),
      queryClient.invalidateQueries({ queryKey: ["my-employer-team"] }),
    ]);
    setProxy("");
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    await EmployerAuthService.logout();
    queryClient.clear();
    router.push("/login");
    setUser(null);
    setGod(false);
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
        god,
        proxy,
        register,
        requestLoginOtp,
        verifyLoginOtp,
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
