"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useHeaderContext } from "@/lib/ctx-header";
import { StudentNavigation } from "./navigation/student-navigation";
import { studentNavigationPolicy } from "./navigation/navigation-config";

const TaskSearchNavigation = dynamic(
  () => import("./navigation/task-search-navigation"),
  {
    loading: () => <StudentNavigation preset="app" />,
  },
);

/**
 * Configures the shared StudentNavigation for app pages.
 * Checks whether this route should show a header and applies its display settings.
 * Loads search controls only on /search; public headers use their own wrappers.
 */
export function StudentAppHeader({
  showActions = true,
  transparent = false,
  showSearch = true,
  sticky = true,
  onLogin,
}: {
  showActions?: boolean;
  transparent?: boolean;
  showSearch?: boolean;
  sticky?: boolean;
  onLogin?: () => void;
}) {
  const policy = studentNavigationPolicy(usePathname());
  const { desktopHeaderHidden, navigationHidden } = useHeaderContext();
  if (navigationHidden || !policy.header) return null;
  const props = {
    preset: "app" as const,
    showActions,
    onLogin,
    className: desktopHeaderHidden ? "md:hidden" : undefined,
    config: {
      desktop: sticky ? ("sticky" as const) : ("static" as const),
      mobile: sticky ? ("sticky" as const) : ("static" as const),
      surface: transparent ? ("transparent" as const) : ("solid" as const),
    },
  };
  return policy.search && showSearch && showActions ? (
    <TaskSearchNavigation {...props} />
  ) : (
    <StudentNavigation {...props} />
  );
}

export default StudentAppHeader;
