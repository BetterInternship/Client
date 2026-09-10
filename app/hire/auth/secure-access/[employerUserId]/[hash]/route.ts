import { LinksService } from "@/lib/api/links.api";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ employerUserId: string; hash: string }>;
  },
) {
  const { employerUserId, hash } = await params;
  const requestUrl = new URL(request.url);

  return new Response(null, {
    status: 307,
    headers: {
      Location: LinksService.secureAccessUrl(employerUserId, hash, {
        next: requestUrl.searchParams.get("next") ?? undefined,
        auto_link: requestUrl.searchParams.get("auto_link") ?? undefined,
      }),
      "Cache-Control": "private, no-store",
    },
  });
}
