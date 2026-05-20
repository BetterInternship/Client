"use client";

import { usePathname } from "next/navigation";
import { useMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { useHeaderContext } from "@/lib/ctx-header";

/**
 * Wrapper component that only renders MobileBottomNav on mobile devices
 * Hides on homepage
 */
export default function MobileNavWrapper() {
  const { isMobile } = useMobile();
  const pathname = usePathname();
  const { navigationHidden } = useHeaderContext();
  const hide =
    navigationHidden ||
    pathname === "/" ||
    pathname === "/student" ||
    pathname.startsWith("/forms/") ||
    pathname === "/miro" ||
    pathname === "/fff" ||
    pathname === "/super-listing" ||
    pathname === "/register" ||
    pathname === "/register/verify" ||
    pathname.startsWith("/companies/");

  if (!isMobile || hide) {
    return null;
  }

  return <MobileBottomNav />;
}
