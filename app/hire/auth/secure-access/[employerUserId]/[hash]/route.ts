/**
 * Forwards minted employer magic links to the API endpoint that consumes the
 * keyring and sets the employer auth cookies.
 */
import { API_ORIGIN } from "@/lib/api/api-origin";
import { secureAccessUrl } from "@/lib/api/urls";

export async function GET(
  request: Request,
  {
    params,
  }: { params: Promise<{ employerUserId: string; hash: string }> },
) {
  const { employerUserId, hash } = await params;
  if (!API_ORIGIN) {
    return Response.redirect(new URL('/login', request.url), 307);
  }

  const apiUrl = new URL(secureAccessUrl(employerUserId, hash));
  apiUrl.search = new URL(request.url).search;

  return Response.redirect(apiUrl, 307);
}
