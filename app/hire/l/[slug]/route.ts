import { resolveShortLinkRedirect } from "@/lib/short-link-redirect";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return resolveShortLinkRedirect(request, slug);
}
