"use client";

import { usePathname } from "next/navigation";
import { useMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";

/**
 * Wrapper component that only renders MobileBottomNav on mobile devices
 * Hides on homepage
 */
export default function MobileNavWrapper() {
  const { isMobile } = useMobile();
  const pathname = usePathname();
  const hide =
    pathname === "/" ||
    pathname === "/student" ||
    pathname.startsWith("/forms/") ||
    pathname === "/miro";

  if (!isMobile || hide) {
    return null;
  }

  return <MobileBottomNav />;
}
