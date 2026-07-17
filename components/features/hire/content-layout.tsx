"use client";

import { useMobile } from "@/hooks/use-mobile";
import { Plus, Briefcase, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { useAuthContext } from "@/app/hire/authctx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/listings/create",
    icon: <Plus />,
    label: "Add Listing",
  },
  {
    href: "/dashboard",
    icon: <Briefcase />,
    label: "Job listings",
  },
  {
    href: "/help",
    icon: <HelpCircle />,
    label: "Help",
  },
];

function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col p-3 gap-2">
      {items.map(({ href, label, icon }) => {
        const isActive = pathname.includes(href);

        return (
          <Link key={label} href={href}>
            <Button
              variant="ghost"
              scheme="default"
              className={cn(
                "w-full h-10 pl-4 flex flex-row justify-between border-0 hover:bg-primary/15 hover:text-primary",
                isActive ? "text-primary bg-primary/10" : "font-normal",
                label === "Add Listing"
                  ? "bg-primary text-white hover:bg-primary hover:text-white"
                  : "",
                isActive && "[&_svg]:fill-primary/20",
              )}
            >
              <div className="flex items-center w-full flex-row gap-2 lg:pr-24">
                <div className="relative">{icon}</div>
                <div className="hidden lg:block">{label}</div>
              </div>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

interface ContentLayoutProps {
  children?: React.ReactNode;
  className?: string;
  /** Renders full-bleed above the padded content, flush to the sidebar and
   * the top of the content pane (e.g. a page-level banner). */
  topSlot?: React.ReactNode;
}

const ContentLayout: React.FC<ContentLayoutProps> = ({
  children,
  className,
  topSlot,
}) => {
  const { isMobile } = useMobile();
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="w-full h-full flex flex-row space-x-0">
      {!isMobile ? (
        <>
          <aside className={cn("z-[100] min-h-stretch border-r bg-muted")}>
            {isAuthenticated() && <SideNav items={navItems} />}
          </aside>
        </>
      ) : (
        <></>
      )}
      <main className="flex-1 flex flex-col overflow-auto">
        {topSlot}
        <div
          className={cn(
            "flex-1 flex justify-center pt-4",
            isMobile ? "px-2" : "px-8",
            className,
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default ContentLayout;
