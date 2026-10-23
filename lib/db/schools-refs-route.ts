import "server-only";
import { NextResponse } from "next/server";
import { getSchoolsRefs } from "./use-refs-backend";

/**
 * GET /api/refs/schools — universities, colleges and departments for the
 * browser (SchoolsRefsLoader in lib/db/use-refs.tsx).
 *
 * Re-exported from both app/student/api/refs/schools and
 * app/hire/api/refs/schools, because the host rewrites in next.config.mjs send
 * each host's paths into its own tree. Both share one cache entry, cleared by
 * POST /api/refs/schools/revalidate.
 *
 * `no-store` keeps the browser's HTTP cache out of it: React Query already
 * keeps (and persists) a copy and refetches it on every app mount.
 */
export async function GET() {
  return NextResponse.json(await getSchoolsRefs(), {
    headers: { "Cache-Control": "no-store" },
  });
}
