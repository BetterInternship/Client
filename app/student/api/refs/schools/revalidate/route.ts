import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { SCHOOLS_REFS_TAG } from "@/lib/db/use-refs-backend";
import { secretMatches } from "@/lib/server/revalidate-secret";

/**
 * POST /api/refs/schools/revalidate — clears the cached schools refs
 * (universities, colleges, departments) behind GET /api/refs/schools.
 * Header `x-refs-secret`; the body is ignored.
 *
 * No page depends on SCHOOLS_REFS_TAG, so this never makes a built page stale.
 *
 * Next applies a tag's invalidation when the request that asked for it ends,
 * so the cache can't be refilled here. The caller refills it with a plain
 * GET /api/refs/schools once this returns.
 *
 * Lives under app/student only: it's called server-to-server through the
 * student host.
 */
export function POST(request: Request) {
  const expected = process.env.REFS_REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { message: "Revalidation is not configured." },
      { status: 503 },
    );
  }
  const given = request.headers.get("x-refs-secret") ?? "";
  if (!secretMatches(given, expected)) {
    return NextResponse.json({ message: "Unauthorised." }, { status: 401 });
  }

  revalidateTag(SCHOOLS_REFS_TAG);
  return NextResponse.json({ revalidated: [SCHOOLS_REFS_TAG] });
}
