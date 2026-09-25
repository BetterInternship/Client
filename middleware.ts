import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// these two are already indexed on google if you search site:betterinternship.com.
// need to send a noindex header to request google to remove it from indexing.
const NOINDEX_HOSTS = new Set([
  "dev.betterinternship.com",
  "hire.dev.betterinternship.com",
  "admin.iom.betterinternship.com",
  "dev.admin.iom.betterinternship.com",
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const response = NextResponse.next();

  if (NOINDEX_HOSTS.has(host)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
