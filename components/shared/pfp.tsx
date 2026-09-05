"use client";

import { Avatar } from "../ui/avatar";
import { usePfpUrl, type PfpSource } from "@/hooks/use-pfp";

export { PFP_UPDATED_EVENT } from "@/hooks/use-pfp";

// next.config.mjs's domain rewrite deliberately excludes image extensions,
// so "/images/default-pfp.jpg" never resolves to either audience's actual
// asset (public/hire/images/... or public/student/images/...) — it 404s
// and renders as a blank/broken image. Route by source instead.
const DEFAULT_PFP_URL: Record<PfpSource, string> = {
  employer: "/hire/images/default-pfp.jpg",
  users: "/student/images/default-pfp.jpg",
};

/**
 * A profile picture of a given user.
 *
 * @component
 */
const Pfp = ({
  id,
  source,
  size = "10",
}: {
  id: string;
  source: PfpSource;
  size?: string;
}) => {
  const defaultURL = DEFAULT_PFP_URL[source];
  const { url, loading } = usePfpUrl({ id, source, defaultURL });

  return (
    <Avatar
      className={`relative w-${size} h-${size} flex items-center border border-gray-300 rounded-full overflow-hidden aspect-square`}
    >
      {loading ? (
        <div className="rounded-full w-[100%] h-[100%] border-b-2 border-primary mx-auto">
          <img src={defaultURL}></img>
        </div>
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
  return <Pfp key={user_id} id={user_id} size={size} source={"users"} />;
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
  return <Pfp id={employer_id} size={size} source={"employer"} />;
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
