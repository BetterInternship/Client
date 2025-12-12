"use client";

import { useConversation, useConversations } from "@/hooks/use-conversation";
import { useMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, Plus, MessageCircleMore, FileText, FileUser, Briefcase, MessageCircleQuestion, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
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
  const { unreads } = useConversations();

  const sortedUnreads = useMemo(
          () =>
          (unreads.filter((c, index, self) => (c?.subscribers?.length > 1) && 
          index === self.findIndex((ca) => (
              ca.id === c.id
          ))) ?? []).toSorted(
              (a, b) =>
              (b.last_unread?.timestamp ?? 0) - (a.last_unread?.timestamp ?? 0),
          ),
          [unreads],
      );

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
                "w-full h-10 pl-4 flex flex-row justify-between border-0 hover:bg-primary/15 hover:text-primary",
                isActive ? "text-primary bg-primary/10" : "font-normal",
                label === "Add Listing" ? "bg-primary text-white hover:bg-primary hover:text-white" : "",
                isActive && "[&_svg]:fill-primary [&_svg]:stroke-primary-foreground"
              )}
            >
              <div className="flex items-center w-full flex-row gap-2">
                {icon}
                <div className="hidden lg:block">
                  {label}
                </div>
              </div>
              <div className="lg:pl-24">
                {(label === "Chats" && unreads.length > 0) && <div className="bg-primary rounded-full text-white text-[11px] px-2 font-bold">{unreads.length}</div>}
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
