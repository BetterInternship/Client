"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, FileUser } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    label: "My Applications",
  },
  {
    href: "/listings",
    icon: <FileText className="h-5 w-5" />,
    label: "My Listings",
  },
  {
    href: "#",
    icon: <FileUser className="h-5 w-5" />,
    label: "Forms Automation",
  },
];

function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col">
      {items.map(({ href, label, icon }) => (
        <Link key={label} href={href}>
          <Button
            variant="ghost"
            scheme="default"
            onClick={() =>
              label === "Forms Automation" && alert("Coming Soon!")
            }
            className={cn(
              "w-full h-10 px-8 flex flex-row justify-start border-0 rounded-none",
              pathname === href ? "text-primary bg-gray-200" : "font-normal"
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
  return (
    <div className="w-full flex flex-row space-x-0 ">
      <aside className="absolute top-18 left-0 z-[100] h-screen border-r bg-muted">
        <SideNav items={navItems} />
      </aside>
      {/* This is only here so the main tag below is offset */}
      <aside className="h-screen w-fit invisible">
        <SideNav items={navItems} />
      </aside>

      <main className="flex-1 flex overflow-auto justify-center  mb-20 h-[100%] ">
        {children}
      </main>
    </div>
  );
};

export default ContentLayout;
