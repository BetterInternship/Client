import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  TOP_SITEMAP_TAG,
  fetchTopCategory,
  fetchTopSitemap,
  fetchTopUniversitySummary,
} from "@/lib/api/top-page.server";

/**
 * POST /api/top-pages/revalidate — Career-Server's way of telling the cached
 * Top pages that their data changed
 * (Docs/plans/TOP_PAGES_STATIC_GENERATION_PLAN.md §3). Header
 * `x-top-pages-secret`; body `{ tags: string[], action?: "revalidate" | "prime" }`.
 *
 *   revalidate  marks each tag stale, and with it every page built from it,
 *               in all regions. Pages are not rebuilt here: they rebuild on
 *               their next visit, which Career-Server's warm-up makes happen
 *               right away.
 *   prime       fetches the category / university data behind each tag once,
 *               so the cache is full again before any page renders —
 *               otherwise the first pages to rebuild would each find it empty
 *               and ask Career-Server for it at the same moment.
 *
 * Two requests rather than one because Next applies a tag's invalidation when
 * the request that asked for it ends: data fetched in that same request is
 * stored, and then immediately counted stale (verified on a production build).
 * Career-Server sends `revalidate`, waits for the answer, then sends `prime`.
 *
 * Lives under app/student because the host rewrites in next.config.mjs send
 * the student hosts' paths there.
 */

const MAX_TAGS = 2000;
const PRIME_CONCURRENCY = 4;
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
const TAG_PATTERN = new RegExp(
  `^(?:${TOP_SITEMAP_TAG}|top:cat:${SLUG}|top:uni:${SLUG})$`,
);

/** Constant-time comparison that does not leak the secret's length. */
function secretMatches(given: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(given), digest(expected));
}

/** Refills the cache entry a tag guards; false when the server couldn't answer. */
async function prime(tag: string): Promise<boolean> {
  try {
    if (tag === TOP_SITEMAP_TAG) {
      await fetchTopSitemap();
    } else if (tag.startsWith("top:cat:")) {
      await fetchTopCategory(tag.slice("top:cat:".length));
    } else {
      await fetchTopUniversitySummary(tag.slice("top:uni:".length));
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const expected = process.env.TOP_PAGES_REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { message: "Revalidation is not configured." },
      { status: 503 },
    );
  }
  const given = request.headers.get("x-top-pages-secret") ?? "";
  if (!secretMatches(given, expected)) {
    return NextResponse.json({ message: "Unauthorised." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
    action?: unknown;
  } | null;
  const action = body?.action ?? "revalidate";
  const tags = Array.isArray(body?.tags)
    ? Array.from(new Set(body.tags as unknown[]))
    : null;
  if (
    (action !== "revalidate" && action !== "prime") ||
    !tags ||
    tags.length === 0 ||
    tags.length > MAX_TAGS ||
    !tags.every(
      (tag): tag is string => typeof tag === "string" && TAG_PATTERN.test(tag),
    )
  ) {
    return NextResponse.json(
      {
        message:
          'Body must be { tags: string[], action?: "revalidate" | "prime" } of known Top page tags.',
      },
      { status: 400 },
    );
  }

  if (action === "revalidate") {
    for (const tag of tags) revalidateTag(tag);
    return NextResponse.json({ revalidated: tags.length });
  }

  const queue = [...tags];
  const failed: string[] = [];
  await Promise.all(
    Array.from(
      { length: Math.min(PRIME_CONCURRENCY, queue.length) },
      async () => {
        for (let tag = queue.shift(); tag; tag = queue.shift()) {
          if (!(await prime(tag))) failed.push(tag);
        }
      },
    ),
  );

  return NextResponse.json({ primed: tags.length - failed.length, failed });
}
