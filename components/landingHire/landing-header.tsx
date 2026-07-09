import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils/string-utils";
import { HeaderTitle } from "../shared/header";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export type HeaderLink = {
  label: string;
  href: string;
};

/**
 * LandingHeader is a header specifically for the landing page.
 */
export function LandingHeader({
  isPastHero = false,
  links = [],
}: {
  isPastHero?: boolean;
  links?: HeaderLink[];
}) {
  const { isMobile } = useMobile();
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex justify-between items-center bg-transparent fixed top-0 left-0 z-[90] w-screen transition-all",
        isPastHero
          ? "border-b border-gray-200 bg-white/80 backdrop-blur-md"
          : "",
        isMobile ? "px-4 py-3 h-[4rem]" : "py-4 px-8 h-[5rem]",
      )}
    >
      <HeaderTitle />
      <div className="flex gap-2">
        {isMobile ? (
          ""
        ) : (
          <div className="flex items-center text-sm text-primary gap-8 list-none">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  className={cn(isPastHero ? "text-gray-900" : "text-white")}
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="md"
          className={cn(
            "h-10 border-gray-300 hover:bg-gray-50 bg-transparent",
            isPastHero ? "" : "text-white",
          )}
          onClick={() => router.push("/login")}
        >
          Log in
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          className={cn(
            "h-10 border-gray-300 hover:bg-gray-50 bg-transparent",
            isPastHero ? "" : "text-white",
          )}
          onClick={() => router.push("/register")}
        >
          Register
        </Button>
      </div>
    </div>
  );
}
