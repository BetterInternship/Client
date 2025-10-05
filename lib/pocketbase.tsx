"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { APIClient, APIRouteBuilder } from "./api/api-client";
import PocketBase, { AuthRecord } from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_CHAT_URL as string);

interface IPocketbaseContext {
  pb: PocketBase;
  user: AuthRecord;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const PocketbaseContext = createContext<IPocketbaseContext>(
  {} as IPocketbaseContext
);

export const PocketbaseProvider = ({
  type,
  children,
}: {
  type: "employer" | "user";
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<AuthRecord>(null);

  const auth = async (retries: number = 0) => {
    // Already authed
    if (pb.authStore.record) {
      setUser(pb.authStore.record);
      return;
    }

    // Request token
    const route =
      type === "employer"
        ? APIRouteBuilder("conversations").r("auth/hire").build()
        : APIRouteBuilder("conversations").r("auth").build();
    const { token: newToken, user } = await APIClient.post<{
      token: string;
      user: AuthRecord;
    }>(route);

    // Retry if not successful
    if (newToken && user) pb.authStore.save(newToken, user);

    // Set user and token anyway
    setUser(user);
  };

  const logout = async () => {
    pb.authStore.clear();
  };

  const refresh = async () => {
    pb.authStore.clear();
    auth();
  };

  useEffect(() => {
    auth();
  }, []);

  const pocketbaseContext = {
    pb,
    user,
    refresh,
    logout,
  };

  return (
    <PocketbaseContext.Provider value={pocketbaseContext}>
      {children}
    </PocketbaseContext.Provider>
  );
};

/**
 * Make the API easier to deal with.
 *
 * @returns
 */
export const usePocketbase = () => {
  return useContext(PocketbaseContext);
};
