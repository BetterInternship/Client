"use client";

import { Button } from "@betterinternship/components";
import { useRouter } from "next/navigation";

export function Navigation() {
  const router = useRouter();

  const loginRedirect = () =>
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`);

  return (
    <nav
      className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8"
      aria-label="Top"
    >
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <img
            src="/BetterInternshipLogo.png"
            className="inline-block h-7 w-7 sm:h-8 sm:w-8"
            alt="BetterInternship logo"
          />
          <div className="font-primary font-bold tracking-tight text-lg">
            BetterInternship
          </div>
        </div>
        <Button size="md" onClick={loginRedirect}>
          Get started
        </Button>
      </div>
    </nav>
  );
}
