import { useCallback, useMemo, useRef, useState, useEffect} from "react";
import { usersControllerUserById } from "@/lib/api/generated/endpoints/users/users";
import { User, PublicUser} from "@/lib/db/db.types";
import { getFullName } from "@/lib/profile";

// The generated model describes what an employer is allowed to see of a
// student; these hooks have always typed the row as the full `User`.
const fetchUserById = (id: string) =>
  usersControllerUserById(id) as unknown as Promise<{ user: User }>;

export const useUserName = (id: string) => {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    if (id.trim() === "") return;
    // ! refactor lol
    fetchUserById(id).then(
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
    fetchUserById(id).then(
      ({ user }: { user: User }) => {
        setUser(user);
      }
    );
  }, [id]);

  return {
    user,
  };
};