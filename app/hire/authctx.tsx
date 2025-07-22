"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Employer, PublicEmployerUser } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";
import { EmployerAuthService } from "@/lib/api/hire.api";
import { getFullName } from "@/lib/utils/user-utils";
import { FetchResponse } from "@/lib/api/use-fetch";
import { useQueryClient } from "@tanstack/react-query";
import { usePocketbase } from "@/lib/pocketbase";

interface IAuthContext {
  user: Partial<PublicEmployerUser> | null;
  god: boolean;
  proxy: string;
  register: (
    employer: Partial<Employer>
  ) => Promise<Partial<PublicEmployerUser> | null>;
  verify: (user_id: string, key: string) => Promise<FetchResponse | null>;
  login: (
    email: string,
    password: string
  ) => Promise<Partial<PublicEmployerUser> | null>;
  login_as: (
    employer_id: string
  ) => Promise<Partial<PublicEmployerUser> | null>;
  email_status: (
    email: string
  ) => Promise<{ existing_user: boolean; verified_user: boolean }>;
  logout: () => Promise<void>;
  is_authenticated: () => boolean;
  refresh_authentication: () => void;
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
  const [is_loading, set_is_loading] = useState(true);
  const [is_authenticated, set_is_authenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    const isAuthed = sessionStorage.getItem("isAuthenticated");
    return isAuthed ? JSON.parse(isAuthed) : false;
  });
  const queryClient = useQueryClient();
  const pocketbase = usePocketbase("employer");
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

    if (is_authenticated)
      sessionStorage.setItem("isAuthenticated", JSON.stringify(true));
    else sessionStorage.removeItem("isAuthenticated");
  }, [user, is_authenticated]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] });
    queryClient.invalidateQueries({ queryKey: ["my-employer-conversations"] });
    queryClient.invalidateQueries({ queryKey: ["god-employers"] });
  }, [is_authenticated]);

  const refresh_authentication =
    async (): Promise<Partial<PublicEmployerUser> | null> => {
      const response = await EmployerAuthService.loggedin();

      if (!response.success) {
        set_is_loading(false);
        return null;
      }

      setUser(response.user as PublicEmployerUser);

      // @ts-ignore
      if (response.god) setGod(true);

      set_is_authenticated(true);
      set_is_loading(false);
      return response.user as PublicEmployerUser;
    };

  const register = async (employer: Partial<Employer>) => {
    const response = await EmployerAuthService.register(employer);
    if (!response.success) {
      return null;
    }

    return response;
  };

  const login = async (email: string, password: string) => {
    const response = await EmployerAuthService.login(email, password);
    if (!response.success) return null;

    setUser(response.user as PublicEmployerUser);
    set_is_authenticated(true);

    // @ts-ignore
    if (response.god) setGod(true);

    return response;
  };

  const login_as = async (employer_id: string) => {
    const response = await EmployerAuthService.loginAsEmployer(employer_id);
    if (!response.success) {
      alert("Error logging in by proxy.");
      return null;
    }

    pocketbase.refresh();
    queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] });
    setProxy(getFullName(response.user));
    setUser(response.user);
    return response.user;
  };

  const email_status = async (email: string) => {
    const response = await EmployerAuthService.email_status(email);
    return response;
  };

  const logout = async () => {
    pocketbase.logout();
    await EmployerAuthService.logout();

    router.push("/login");
    setUser(null);
    setGod(false);
    set_is_authenticated(false);
  };

  const redirect_if_not_logged_in = () =>
    useEffect(() => {
      if (!is_loading && !is_authenticated) router.push("/login");
    }, [is_authenticated, is_loading]);

  const redirect_if_logged_in = () =>
    useEffect(() => {
      if (!is_loading && is_authenticated) router.push("/dashboard");
    }, [is_authenticated, is_loading]);

  useEffect(() => {
    refresh_authentication();
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
        login_as,
        email_status,
        logout,
        refresh_authentication,
        is_authenticated: () => is_authenticated,
        redirectIfNotLoggedIn: redirect_if_not_logged_in,
        redirectIfLoggedIn: redirect_if_logged_in,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
