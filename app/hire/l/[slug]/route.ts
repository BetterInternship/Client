/**
 * Resolves employer-portal short links using the shared links API.
 * Unknown slugs and API failures return the visitor to the employer home page.
 */
import { LinkService } from "@/lib/api/services";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const origin = new URL(request.url).origin;

  try {
    const data = await LinkService.resolve(slug, { cache: "no-store" });
    return Response.redirect(data?.url ?? origin, 307);
  } catch {
    return Response.redirect(origin, 307);
  }
}
