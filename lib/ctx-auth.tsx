"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { PublicUser } from "@/lib/db/db.types";
import { AuthService, UserService } from "@/lib/api/services";
import { useRouter } from "next/navigation";
import { FetchResponse } from "@/lib/api/use-fetch";
import { useQueryClient } from "@tanstack/react-query";
import { usePocketbase } from "./pocketbase";

interface IAuthContext {
  register: (
    user: Partial<PublicUser>,
  ) => Promise<
    ({ user: Partial<PublicUser>; message?: string } & FetchResponse) | null
  >;
  verify: (
    userId: string,
    key: string,
  ) => Promise<Partial<PublicUser> & FetchResponse>;
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
  const pocketbase = usePocketbase();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    const isAuthed = sessionStorage.getItem("is_authenticated");
    return isAuthed ? JSON.parse(isAuthed) : false;
  });

  const refreshAuthentication = async () => {
    const response = await UserService.getMyProfile();

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

  const register = async (user: Partial<PublicUser>) => {
    await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    await queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["my-forms"] });
    await queryClient.invalidateQueries({ queryKey: ["my-form-templates"] });
    await queryClient.invalidateQueries({ queryKey: ["my-form-template"] });
    return await AuthService.register(user);
  };

  const verify = async (userId: string, key: string) => {
    const response = await AuthService.verify(userId, key);
    if (!response.success) return null;
    await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    await queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["my-forms"] });
    await queryClient.invalidateQueries({ queryKey: ["my-form-templates"] });
    await queryClient.invalidateQueries({ queryKey: ["my-form-template"] });
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await pocketbase.logout();
    await AuthService.logout();
    await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    await queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["my-forms"] });
    await queryClient.invalidateQueries({ queryKey: ["my-form-templates"] });
    await queryClient.invalidateQueries({ queryKey: ["my-form-template"] });
    setIsAuthenticated(false);
  };

  const redirectIfNotLoggedIn = () =>
    useEffect(() => {
      if (!isLoading && !isAuthenticated)
        router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`);
    }, [isAuthenticated, isLoading]);

  const redirectIfLoggedIn = () =>
    useEffect(() => {
      if (!isLoading && isAuthenticated) router.push("/search");
    }, [isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        register,
        // @ts-ignore
        verify,
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
