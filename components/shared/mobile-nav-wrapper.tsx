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
  const isHomepage = pathname === "/" || pathname === "/student";

  if (!isMobile || isHomepage) {
    return null;
  }

  return <MobileBottomNav />;
}
