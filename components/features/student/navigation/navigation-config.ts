import { isPrivateStudentRoute } from "@/lib/student-public-routes";

export type NavigationPosition = "static" | "sticky" | "hide-on-scroll";
export type NavigationSurface = "solid" | "transparent" | "translucent";
export type NavigationPreset = "public" | "editorial" | "app";

export interface StudentNavigationLink {
  label: string;
  href: string;
  current?: boolean;
}

export interface StudentNavigationConfig {
  desktop: NavigationPosition;
  mobile: NavigationPosition;
  surface: NavigationSurface;
  /** Transparent surfaces become solid after this scroll offset. */
  solidAfter: number;
}

export const navigationPresets: Record<
  NavigationPreset,
  StudentNavigationConfig
> = {
  public: {
    desktop: "static",
    mobile: "static",
    surface: "solid",
    solidAfter: 76,
  },
  editorial: {
    desktop: "sticky",
    mobile: "static",
    surface: "transparent",
    solidAfter: 160,
  },
  app: {
    desktop: "sticky",
    mobile: "hide-on-scroll",
    surface: "solid",
    solidAfter: 76,
  },
};

export function normalizeStudentPath(pathname: string | null): string {
  const path = (pathname || "/").replace(/^\/student(?=\/|$)/, "") || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

const within = (path: string, base: string) =>
  path === base || path.startsWith(`${base}/`);

export function studentNavigationPolicy(
  pathname: string | null,
  isTop = false,
) {
  const path = normalizeStudentPath(pathname);
  const landing = path === "/";
  const guides = within(path, "/guides");
  const bespoke = [
    "/companies",
    "/challenges",
    "/super-listing",
    "/miro",
    "/fff",
  ].some((base) => within(path, base));
  const registration = within(path, "/register");
  const details = within(path, "/search") && path !== "/search";
  return {
    path,
    landing,
    guides,
    isTop,
    publicLinks: landing || guides || isTop,
    pageOwnedHeader: landing || guides || isTop || bespoke,
    header: !bespoke && !registration && !details,
    bottom:
      !landing &&
      !guides &&
      !bespoke &&
      !registration &&
      !path.startsWith("/forms/"),
    search: path === "/search",
    privatePage: isPrivateStudentRoute(path),
  };
}

export function studentCoreLinks(formsEnabled: boolean) {
  return [
    { label: "Home", href: "/search" },
    ...(formsEnabled ? [{ label: "Forms", href: "/forms" }] : []),
    { label: "My Jobs", href: "/applications" },
  ];
}

export function isStudentLinkActive(path: string, href: string) {
  if (href === "/applications")
    return within(path, href) || within(path, "/saved");
  return within(path, href);
}
