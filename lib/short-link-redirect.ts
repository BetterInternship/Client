import { LinksService } from "./api/links.api";

export async function resolveShortLinkRedirect(
  request: Request,
  slug: string,
): Promise<Response> {
  let destination = new URL(request.url).origin;

  try {
    destination = (await LinksService.resolve(slug)) ?? destination;
  } catch {
    // Unknown or unavailable links intentionally return visitors to the portal.
  }

  return new Response(null, {
    status: 307,
    headers: {
      Location: destination,
      "Cache-Control": "private, no-store",
    },
  });
}
