"use client";

import { useMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, Plus, MessageCircleMore, FileText, FileUser, Briefcase, MessageCircleQuestion, HelpCircle } from "lucide-react";
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
    href: "/conversations",
    icon: <MessageCircleMore />,
    label: "Chats",
  },
  {
    href: "/help",
    icon: <HelpCircle />,
    label: "Help",
  },
];

function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { god } = useAuthContext();

  return (
    <nav className="flex flex-col p-3 gap-2">
      {items.map(({ href, label, icon}) => {
        const isActive = pathname.includes(href);

        return (
          <Link
            key={label}
            href={label !== "Forms Automation" || god ? href : "#"}
          >
            <Button
              variant="ghost"
              scheme="default"
              onClick={() =>
                god && label === "Forms Automation" && alert("Coming Soon!")
              }
              className={cn(
                "w-full h-10 pl-4 lg:pr-24 flex flex-row justify-start border-0 hover:bg-primary/15 hover:text-primary",
                isActive ? "text-primary bg-primary/10" : "font-normal",
                label === "Add Listing" ? "bg-primary text-white hover:bg-primary hover:text-white" : "",
                isActive && "[&_svg]:fill-primary [&_svg]:stroke-primary-foreground"
              )}
            >
              {icon}
              <div className="hidden lg:block">
                {label}
              </div>
            </Button>
          </Link>
        )
      })}
    </nav>
  );
}

interface ContentLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

const ContentLayout: React.FC<ContentLayoutProps> = ({ children, className }) => {
  const { isMobile } = useMobile();
  
  return (
    <div className="w-full h-full flex flex-row space-x-0">
      {!isMobile ? (
        <>
          <aside 
            className={cn(
              "z-[100] min-h-stretch border-r bg-muted",
            )}
          >
            <SideNav items={navItems} />
          </aside>
        </>
      ) : (
        <></>
      )} 
      <main className={cn(
        "flex-1 flex overflow-auto justify-center pt-4",
        isMobile ? "px-2" : "px-8",
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default ContentLayout;
