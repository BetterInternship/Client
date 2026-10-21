/** Match whole path segments so /guides-other remains an application route. */
export function isGuidesRoute(pathname: string) {
  return /^\/(?:student\/)?guides(?:\/|$)/.test(pathname);
}

export function isLightweightStudentRoute(pathname: string) {
  return pathname === "/" || pathname === "/student" || isGuidesRoute(pathname);
}

/** Private student pages reset their local state when the account changes. */
export function isPrivateStudentRoute(pathname: string) {
  const path = pathname.replace(/^\/student(?=\/|$)/, "") || "/";
  return ["/profile", "/forms", "/applications", "/saved", "/discord"].some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}
