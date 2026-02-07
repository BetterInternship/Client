"use client";

import { useMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";

/**
 * Wrapper component that only renders MobileBottomNav on mobile devices
 */
export default function MobileNavWrapper() {
  const { isMobile } = useMobile();

  if (!isMobile) {
    return null;
  }

  return <MobileBottomNav />;
}
