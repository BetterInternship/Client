"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { useHeaderContext } from "@/lib/ctx-header";

export default function MobileNavWrapper() {
  const pathname = usePathname();
  const { navigationHidden } = useHeaderContext();
  const hide =
    navigationHidden ||
    pathname === "/" ||
    pathname === "/student" ||
    pathname.startsWith("/forms/") ||
    pathname === "/miro" ||
    pathname === "/fff" ||
    pathname === "/register" ||
    pathname === "/register/verify" ||
    pathname.startsWith("/companies/") ||
    pathname === "/super-listing" ||
    pathname.startsWith("/super-listing/");

  if (hide) {
    return null;
  }

  return <MobileBottomNav />;
}
