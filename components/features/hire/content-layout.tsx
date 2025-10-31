"use client";

import { FileText, FileUser, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useMobile } from "@/hooks/use-mobile";

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
    icon: <Plus className="h-5 w-5" />,
    label: "Add Listing",
  },
  {
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
  },
  {
    href: "/listings",
    icon: <FileText className="h-5 w-5" />,
    label: "My Listings",
  },
  {
    href: "/forms-management",
    icon: <FileUser className="h-5 w-5" />,
    label: "Forms Automation",
  },
];

function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { god } = useAuthContext();

  return (
    <nav className="flex flex-col">
      {items.map(({ href, label, icon}) => (
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
              "w-full h-10 px-8 flex flex-row justify-start border-0 rounded-none",
              pathname.includes(href) ? "text-primary bg-gray-200" : "font-normal",
              label === "Add Listing" ? "bg-primary text-white hover:bg-primary-300" : ""
            )}
          >
            {icon}
            {label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

interface ContentLayoutProps {
  children?: React.ReactNode;
}

const ContentLayout: React.FC<ContentLayoutProps> = ({ children }) => {
  const { isMobile } = useMobile();
  
  return (
    <div className="w-full flex flex-row space-x-0">
      {!isMobile ? (
        <>
          <aside className="absolute top-20 left-0 z-[100] h-screen border-r bg-muted">
            <SideNav items={navItems} />
          </aside>
          {/* This is only here so the main tag below is offset */}
          <aside className="h-screen w-fit invisible">
            <SideNav items={navItems} />
          </aside>
        </>
      ) : (
        <></>
      )} 
      <main className="flex-1 flex overflow-auto justify-center mb-20 h-[100%] ">
        {children}
      </main>
    </div>
  );
};

export default ContentLayout;
