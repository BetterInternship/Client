/**
 * Forwards minted employer magic links to the API endpoint that consumes the
 * keyring and sets the employer auth cookies.
 */
export async function GET(
  request: Request,
  {
    params,
  }: { params: Promise<{ employerUserId: string; hash: string }> },
) {
  const { employerUserId, hash } = await params;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

  if (!apiBaseUrl) {
    return Response.redirect(new URL('/login', request.url), 307);
  }

  const apiUrl = new URL(
    `${apiBaseUrl}/auth/secure-access/${encodeURIComponent(employerUserId)}/${encodeURIComponent(hash)}`,
  );
  apiUrl.search = new URL(request.url).search;

  return Response.redirect(apiUrl, 307);
}
