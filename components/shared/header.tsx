import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuthContext } from "@/app/hire/authctx";

export const HeaderTitle = () => {
  const { isMobile, view } = useAppContext();
  const { isAuthenticated } = useAuthContext();

  return (
    <Link
      href={
        view === "student"
          ? "/search"
          : isAuthenticated && isAuthenticated()
            ? "/dashboard"
            : "/"
      }
      className="block outline-none focus:outline-none border-none"
    >
      <h1
        className={cn(
          "font-display font-bold text-gray-900 flex flex-row space-x-2 items-center",
          isMobile ? "text-lg" : "text-xl",
        )}
      >
        <img
          src="/BetterInternshipLogo.png"
          className="w-8 h-8 aspect-square object-contain"
          alt="BetterInternship logo"
        ></img>
        <span className="xl:inline-block hidden">BetterInternship</span>
      </h1>
    </Link>
  );
};
