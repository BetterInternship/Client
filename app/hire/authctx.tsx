"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Employer, PublicEmployerUser } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { EmployerAuthService } from "@/lib/api/hire.api";
import { getFullName } from "@/lib/profile";
import { FetchResponse } from "@/lib/api/use-fetch";
import { useQueryClient } from "@tanstack/react-query";
import { usePocketbase } from "@/lib/pocketbase";
import { EmployerService } from "@/lib/api/services";
import { useRef } from "react";

interface IAuthContext {
  user: Partial<PublicEmployerUser> | null;
  god: boolean;
  proxy: string;
  loading: boolean;
  register: (
    employer: Partial<Employer>,
  ) => Promise<Partial<PublicEmployerUser> | null>;
  verify: (user_id: string, key: string) => Promise<FetchResponse | null>;
  login: (
    email: string,
    password: string,
  ) => Promise<Partial<PublicEmployerUser> | null>;
  loginAs: (employer_id: string) => Promise<Partial<PublicEmployerUser> | null>;
  emailStatus: (
    email: string,
  ) => Promise<{ existing_user: boolean; verified_user: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  refreshAuthentication: () => void;
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
  const pocketbase = usePocketbase();
  const [god, setGod] = useState(false);
  const [user, setUser] = useState<Partial<PublicEmployerUser> | null>(() => {
    if (typeof window === "undefined") return null;
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });

  // Whenever user is updated, cache in localStorage
  useEffect(() => {
    if (user) sessionStorage.setItem("user", JSON.stringify(user));
    else sessionStorage.removeItem("user");

    if (isAuthenticated)
      sessionStorage.setItem("isAuthenticated", JSON.stringify(true));
    else sessionStorage.removeItem("isAuthenticated");
  }, [user, isAuthenticated]);

  const refreshAuthentication =
    async (): Promise<Partial<PublicEmployerUser> | null> => {
      const response = await EmployerService.getMyProfile();

      if (!response.success) {
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("user");
        setLoading(false);
        return null;
      }

      setUser(response.user as PublicEmployerUser);

      // @ts-ignore
      if (response.god) setGod(true);

      setIsAuthenticated(true);
      setLoading(false);
      return response.user as PublicEmployerUser;
    };

  const register = async (employer: Partial<Employer>) => {
    const response = await EmployerAuthService.register(employer);
    return response;
  };

  const login = async (email: string, password: string) => {
    const response = await EmployerAuthService.login(email, password);
    if (!response.success) return null;

    await queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] });
    await queryClient.invalidateQueries({
      queryKey: ["my-employer-conversations"],
    });

    setUser(response.user as PublicEmployerUser);
    setIsAuthenticated(true);

    // @ts-expect-error
    if (response.god) setGod(true);

    return response;
  };

  const loginAs = async (employer_id: string) => {
    const response = await EmployerAuthService.loginAsEmployer(employer_id);
    if (!response.success) {
      alert("Error logging in by proxy.");
      return null;
    }

    await pocketbase.refresh();
    await queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] });
    setProxy(getFullName(response.user));
    setUser(response.user);
    return response.user;
  };

  const emailStatus = async (email: string) => {
    const response = await EmployerAuthService.emailStatus(email);
    return response;
  };

  const logout = async () => {
    await pocketbase.logout();
    await EmployerAuthService.logout();

    await queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] });
    await queryClient.invalidateQueries({
      queryKey: ["my-employer-conversations"],
    });

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
        router.push("/dashboard")
      };

      if (!loading) {
        effectRan.current = true;
      }
    }, [isAuthenticated, loading]);
  }

  useEffect(() => {
    refreshAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        god,
        proxy,
        // @ts-ignore
        register,
        // @ts-ignore
        login,
        loginAs,
        loading,
        emailStatus,
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
