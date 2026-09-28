/**
 * Resolves employer-portal short links using the shared links API.
 * Unknown slugs and API failures return the visitor to the employer home page.
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
