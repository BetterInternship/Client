export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const origin = new URL(request.url).origin;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/links/${slug}`,
      { cache: 'no-store' },
    );
    const data = (await res.json()) as { url?: string | null };
    const response = Response.redirect(data?.url ?? origin, 307);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch {
    const response = Response.redirect(origin, 307);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }
}
