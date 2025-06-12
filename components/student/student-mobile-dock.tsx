"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, FileText, Bookmark, User } from "lucide-react";
import Dock, { DockItemData } from "./mobile-dock";
import { useIsMobile } from "@/components/ui/use-mobile";

export function StudentMobileDock() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Only show on screens 1024px and below
  if (!isMobile) return null;

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  const getIconColor = (path: string) => {
    return isActive(path) ? "text-blue-600" : "text-gray-600";
  };

  const dockItems: DockItemData[] = [
    {
      icon: <Home className={`h-6 w-6 ${getIconColor('/')}`} />,
      label: "Home",
      onClick: () => router.push('/'),
      className: isActive('/') && pathname === '/' ? 'ring-2 ring-blue-200' : ''
    },
    {
      icon: <Search className={`h-6 w-6 ${getIconColor('/search')}`} />,
      label: "Search",
      onClick: () => router.push('/search'),
      className: isActive('/search') ? 'ring-2 ring-blue-200' : ''
    },
    {
      icon: <FileText className={`h-6 w-6 ${getIconColor('/applications')}`} />,
      label: "Applications",
      onClick: () => router.push('/applications'),
      className: isActive('/applications') ? 'ring-2 ring-blue-200' : ''
    },
    {
      icon: <Bookmark className={`h-6 w-6 ${getIconColor('/saved')}`} />,
      label: "Saved Jobs",
      onClick: () => router.push('/saved'),
      className: isActive('/saved') ? 'ring-2 ring-blue-200' : ''
    },
    {
      icon: <User className={`h-6 w-6 ${getIconColor('/profile')}`} />,
      label: "Profile",
      onClick: () => router.push('/profile'),
      className: isActive('/profile') ? 'ring-2 ring-blue-200' : ''
    }
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <Dock
          items={dockItems}
          magnification={60}
          distance={150}
          panelHeight={60}
          baseItemSize={48}
        />
      </div>
    </div>
  );
}

export default StudentMobileDock;
