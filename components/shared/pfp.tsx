import { useFile } from "@/hooks/use-file";
import { EmployerService, UserService } from "@/lib/api/services";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Loader } from "../ui/loader";

/**
 * A profile picture of a given user.
 * Accessible only to employers.
 *
 * @component
 */
const Pfp = ({
  id,
  source,
  pfp_fetcher,
  size = "10",
  onRefresh,
}: {
  id: string;
  source: string;
  pfp_fetcher: () => Promise<any>;
  size?: string;
  onRefresh?: boolean;
}) => {

  const { url, sync, loading } = useFile({
    route: `/${source}/` + id + "/pic",
    fetcher: pfp_fetcher,
    defaultURL: "/images/default-pfp.jpg",
  });

  useEffect(() => {
    sync();
  }, []);

  return (
    <Avatar
      className={`relative w-${size} h-${size} flex items-center border border-gray-300 rounded-full overflow-hidden aspect-square`}
    >
      {loading ? (
        <div className="animate-spin rounded-full w-[100%] h-[100%] border-b-2 border-primary mx-auto"></div>
      ) : (
        <img src={url}></img>
      )}
    </Avatar>
  );
};

/**
 * A profile picture of a given user.
 * Accessible only to employers.
 *
 * @component
 */
export const UserPfp = ({
  user_id,
  size = "10",
}: {
  user_id: string;
  size?: string;
}) => {

  const pfp_fetcher = useCallback(
    async () => UserService.getUserPfpURL(user_id),
    [user_id]
  );

  return (
    <Pfp key={user_id} id={user_id} size={size} source={"users"} pfp_fetcher={pfp_fetcher}/>
  );
};

/**
 * A profile picture of a given employer.
 * Accessible to users.
 *
 * @component
 */
export const EmployerPfp = ({
  employer_id,
  size = "10",
}: {
  employer_id: string;
  size?: string;
}) => {
  const pfp_fetcher = useCallback(
    async () => EmployerService.getEmployerPfpURL(employer_id),
    [employer_id]
  );

  return (
    <Pfp
      id={employer_id}
      size={size}
      source={"employer"}
      pfp_fetcher={pfp_fetcher}
    />
  );
};

/**
 * A profile picture of a given user.
 * Accessible only to owners of pfp.
 *
 * @component
 */
export const MyUserPfp = ({ size = "10" }: { size?: string }) => {
  return <UserPfp user_id={"me"} size={size} />;
};

/**
 * A profile picture of a given user.
 * Accessible only to owners of pfp.
 *
 * @component
 */
export const MyEmployerPfp = ({ size = "10" }: { size?: string }) => {
  return <EmployerPfp employer_id={"me"} size={size} />;
};
