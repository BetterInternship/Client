// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Pull this from db next time
const REGISTERED_SCHOOLS = ["dlsu"];

// Helper function for checking subdomain
const subdomain_is = (hostname: string, subdomain: string): boolean =>
  subdomain !== "" ? hostname.startsWith(subdomain + ".") : true;

// Redirection
const reroute_to_subdomain = (
  subdomain: string,
  pathname_url: URL,
  request_url: string
) =>
  NextResponse.rewrite(
    new URL(`/${subdomain}${pathname_url.pathname}`, request_url)
  );

// Make sure that not all routes are matched
export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export function middleware(request: NextRequest) {
  const pathname = new URL(request.url);
  const hostname = request.headers.get("host") || "";
  const school = REGISTERED_SCHOOLS.filter((school) =>
    subdomain_is(hostname, school)
  );

  // There's a matching school
  if (school.length) {
    return reroute_to_subdomain("school", pathname, request.url);
  }

  if (subdomain_is(hostname, "moa")) {
    return reroute_to_subdomain("moa", pathname, request.url);
  }

  if (subdomain_is(hostname, "hire")) {
    return reroute_to_subdomain("hire", pathname, request.url);
  }

  if (subdomain_is(hostname, "univ")) {
    return reroute_to_subdomain("moa/univ", pathname, request.url);
  }

  if (subdomain_is(hostname, "")) {
    return reroute_to_subdomain("student", pathname, request.url);
  }

  return NextResponse.next();
}
