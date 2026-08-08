/**
 * Resolves a short link. Generic on purpose — it never mentions jobs, so
 * porting it to another repo means changing the API base URL and nothing
 * else (Docs/plans/JOB_SHORT_LINKS_IMPLEMENTATION_PLAN.md §5.1).
 *
 * Always a 307: an unknown slug redirects to the site root rather than
 * erroring, and a temporary redirect means a mis-pointed slug can still be
 * fixed later instead of staying cached in every browser that clicked it (D10).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const origin = new URL(request.url).origin;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/links/${slug}`,
      { cache: "no-store" },
    );
    const data = (await res.json()) as { url?: string | null };
    return Response.redirect(data?.url ?? origin, 307);
  } catch {
    return Response.redirect(origin, 307);
  }
}
