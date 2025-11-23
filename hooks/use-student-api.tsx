import { useCallback, useMemo, useRef, useState, useEffect} from "react";
import { APIClient, APIRouteBuilder } from "@/lib/api/api-client";
import { User, PublicUser} from "@/lib/db/db.types";
import { getFullName } from "@/lib/profile";

export const useUserName = (id: string) => {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    if (id.trim() === "") return;
    // ! refactor lol
    APIClient.get<any>(APIRouteBuilder("users").r(id).build()).then(
      ({ user }: { user: User }) => {
        setUserName(getFullName(user) ?? "");
      }
    );
  }, [id]);

  return {
    userName,
  };
};

export const getUserById = (id: string) => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (id.trim() === "") return;
    // ! refactor lol
    APIClient.get<any>(APIRouteBuilder("users").r(id).build()).then(
      ({ user }: { user: User }) => {
        setUser(user);
      }
    );
  }, [id]);

  return {
    user,
  };
};