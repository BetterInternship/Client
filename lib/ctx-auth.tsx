"use client";

import { PublicUser } from "@/lib/db/db.types";
import { AuthService } from "@/lib/api/services";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FetchResponse } from "@/lib/api/use-fetch";
import { useQueryClient } from "@tanstack/react-query";
import { usePocketbase } from "./pocketbase";

interface IAuthContext {
  register: (
    user: Partial<PublicUser>
  ) => Promise<(Partial<PublicUser> & FetchResponse) | null>;
  verify: (
    userId: string,
    key: string
  ) => Promise<Partial<PublicUser> & FetchResponse>;
  sendOtpRequest: (email: string) => Promise<{ email: string } & FetchResponse>;
  resendOtpRequest: (
    email: string
  ) => Promise<{ email: string } & FetchResponse>;
  verifyOtp: (
    email: string,
    otp: string
  ) => Promise<Partial<PublicUser> & FetchResponse>;
  emailStatus: (
    email: string
  ) => Promise<
    { existing_user: boolean; verified_user: boolean } & FetchResponse
  >;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  refreshAuthentication: () => void;
  redirectIfNotLoggedIn: () => void;
  redirectIfLoggedIn: () => void;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const useAuthContext = () => useContext(AuthContext);

/**
 * Gives access to auth functions to the components inside it.
 *
 * @component
 */
export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pocketbase = usePocketbase("user");
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    const isAuthed = sessionStorage.getItem("is_authenticated");
    return isAuthed ? JSON.parse(isAuthed) : false;
  });

  const refreshAuthentication = async () => {
    const response = await AuthService.isLoggedIn();

    if (!response.success) {
      setIsLoading(false);
      return null;
    }

    pocketbase.refresh();
    setIsAuthenticated(true);
    setIsLoading(false);
    return response.user;
  };

  useEffect(() => {
    refreshAuthentication();
  }, []);

  // Whenever auth occurs, invalidate profile
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
  }, [isAuthenticated]);

  const register = async (user: Partial<PublicUser>) => {
    const response = await AuthService.register(user);
    if (!response.success) return null;
    return response;
  };

  const verify = async (userId: string, key: string) => {
    const response = await AuthService.verify(userId, key);
    if (!response.success) return null;
    setIsAuthenticated(true);
    return response;
  };

  const sendOtpRequest = async (email: string) => {
    const response = await AuthService.sendOtpRequest(email);
    return response;
  };

  const resendOtpRequest = async (email: string) => {
    const response = await AuthService.resendOtpRequest(email);
    return response;
  };

  const verifyOtp = async (email: string, otp: string) => {
    const response = await AuthService.verifyOtp(email, otp);
    if (!response.success) return null;
    setIsAuthenticated(true);
    return response;
  };

  const emailStatus = async (email: string) => {
    const response = await AuthService.emailStatus(email);
    return response;
  };

  const logout = async () => {
    pocketbase.logout();
    AuthService.logout();
    setIsAuthenticated(false);
  };

  const redirectIfNotLoggedIn = () =>
    useEffect(() => {
      if (!isLoading && !isAuthenticated) router.push("/login");
    }, [isAuthenticated, isLoading]);

  const redirectIfLoggedIn = () =>
    useEffect(() => {
      if (!isLoading && isAuthenticated) router.push("/search");
    }, [isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        // @ts-ignore
        register,
        // @ts-ignore
        verify,
        sendOtpRequest,
        resendOtpRequest,
        // @ts-ignore
        verifyOtp,
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
