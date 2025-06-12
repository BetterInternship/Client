"use client";
import { Menu } from "@/components/ui/admin-panel/menu";
import { SidebarToggle } from "@/components/ui/admin-panel/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import Image from "next/image";

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-screen -translate-x-full transition-[width] duration-300 ease-in-out lg:translate-x-0",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden",
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative flex h-full flex-col overflow-y-auto border-r border-gray-800 bg-background px-3 pb-2 pt-6"
      >
        <Button
          className={cn(
            "mb-1 transition-transform duration-300 ease-in-out",
            !getOpenState() ? "translate-x-1" : "translate-x-0",
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-start gap-3 self-start">
            <Image
              key={"/misfits.png"}
              src={"/misfits.png"}
              alt="logo"
              width={30}
              height={30}
            />
            <div
              className={cn(
                "flex flex-col gap-0 font-bold text-black transition-[transform,opacity,display] duration-300 ease-in-out dark:text-white",
                !getOpenState()
                  ? "hidden -translate-x-96 opacity-0"
                  : "translate-x-0 opacity-100",
                "max-w-[250px] whitespace-pre-wrap text-sm sm:text-base md:text-lg",
              )}
            >
              <span>
                {process.env.NEXT_PUBLIC_DASHBOARD_TITLE ||
                  "BetterInternship Dashboard"}
              </span>
            </div>
          </Link>
        </Button>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
