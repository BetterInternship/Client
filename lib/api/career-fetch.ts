/**
 * Mutator for the orval-generated Career-Server client (orval.config.ts).
 *
 * Every generated function ends up here. It must behave exactly like
 * `FetchClient.request` in api-client.ts, because callers read `.success` and
 * `.error` off the results and the persisted React Query cache holds them.
 * The request-shape suite in .tools/client-api-contract-tests checks this
 * from the outside.
 */

import { redirectIfMaintenanceMode } from "./api-client";

// Generated paths start with the server's global prefix (`/api/applications`),
// and NEXT_PUBLIC_API_URL already ends in `/api`. Strip that suffix once so the
// two do not join into `/api/api`.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const isBinaryBody = (body: BodyInit | null | undefined) =>
  (typeof FormData !== "undefined" && body instanceof FormData) ||
  (typeof Blob !== "undefined" && body instanceof Blob);

export const careerFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  if (redirectIfMaintenanceMode()) {
    throw new Error("Application is in maintenance mode.");
  }

  // JSON everywhere (GETs included, as before), except for FormData and Blob
  // bodies, where the browser has to set its own content-type and boundary.
  const headers: HeadersInit = isBinaryBody(options.body)
    ? { ...options.headers }
    : { "Content-Type": "application/json", ...options.headers };

  const url = /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    if (!response.ok && response.status !== 304) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
        [key: string]: unknown;
      };
      console.warn(`${url}: ${errorData.message || response.status}`);
      // Resolve, do not throw. Spread first so `.error` always wins while extra
      // structured fields on the error body (e.g. eligible_listings on a 409)
      // survive.
      return { ...errorData, error: errorData.message } as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};
