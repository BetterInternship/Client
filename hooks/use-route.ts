/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-18 11:08:19
 * @ Modified time: 2025-09-12 21:08:30
 * @ Description:
 *
 * Some routing utils.
 */

import { usePathname } from "next/navigation";

interface IRoute {
  routeExcluded: (routes: string[]) => boolean;
  routeIncluded: (routes: string[]) => boolean;
}

/**
 * Allows us to check for excluded / included routes.
 *
 * @hook
 */
export const useRoute = (): IRoute => {
  const pathname = usePathname();

  // Check if route is excluded in set
  const routeExcluded = (routes: string[]) =>
    !routes.some((route) => pathname.split("?")[0] === route);

  // Check if route is included in set
  const routeIncluded = (routes: string[]) =>
    routes.some((route) => pathname.split("?")[0] === route);

  return {
    routeExcluded,
    routeIncluded,
  };
};
