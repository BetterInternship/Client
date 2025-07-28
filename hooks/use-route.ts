/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-18 11:08:19
 * @ Modified time: 2025-06-18 11:14:14
 * @ Description:
 *
 * Some routing utils.
 */

import { usePathname } from "next/navigation";

interface IRoute {
  routeExcluded: (routes: string[]) => boolean;
  route_included: (routes: string[]) => boolean;
}

/**
 * Allows us to check for excluded / included routes.
 *
 * @hook
 */
export const useRoute = (): IRoute => {
  const pathname = usePathname();

  // Check if route is excluded in set
  const route_excluded = (routes: string[]) =>
    !routes.some((route) => pathname.split("?")[0] === route);

  // Check if route is included in set
  const route_included = (routes: string[]) =>
    routes.some((route) => pathname.split("?")[0] === route);

  return {
    routeExcluded: route_excluded,
    route_included,
  };
};
