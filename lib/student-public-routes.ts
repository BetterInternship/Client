/** Match whole path segments so /guides-other remains an application route. */
export function isGuidesRoute(pathname: string) {
  return /^\/(?:student\/)?guides(?:\/|$)/.test(pathname);
}

export function isLightweightStudentRoute(pathname: string) {
  return pathname === "/" || pathname === "/student" || isGuidesRoute(pathname);
}
