/**
 * Mutator for the orval-generated Career-Server client (orval.config.ts).
 *
 * Every generated function ends up here. It behaves exactly like the
 * hand-written `FetchClient` it replaced, because callers read `.success` and
 * `.error` off the results and the persisted React Query cache holds them.
 * Queries can opt into typed HTTP errors with `throwOnError: true`.
 * The request-shape suite in .tools/client-api-contract-tests checks this
 * from the outside.
 */

import { apiUrl } from "./api-origin";
import { isGodApiPath, redirectToGodLogin } from "./god-session";
import { redirectIfMaintenanceMode } from "./maintenance";

export interface CareerRequestOptions extends RequestInit {
  /** Reject HTTP failures so query consumers can use their normal error state. */
  throwOnError?: boolean;
}

export class CareerApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    const message =
      body && typeof body === "object" && "message" in body
        ? body.message
        : undefined;
    super(
      typeof message === "string"
        ? message
        : `Request failed (HTTP ${status}).`,
    );
    this.name = "CareerApiError";
  }
}

const isBinaryBody = (body: BodyInit | null | undefined) =>
  (typeof FormData !== "undefined" && body instanceof FormData) ||
  (typeof Blob !== "undefined" && body instanceof Blob);

export const careerFetch = async <T>(
  path: string,
  options: CareerRequestOptions = {},
): Promise<T> => {
  const { throwOnError = false, ...requestOptions } = options;
  if (redirectIfMaintenanceMode()) {
    throw new Error("Application is in maintenance mode.");
  }

  // JSON everywhere (GETs included, as before), except for FormData and Blob
  // bodies, where the browser has to set its own content-type and boundary.
  const headers: HeadersInit = isBinaryBody(options.body)
    ? { ...options.headers }
    : { "Content-Type": "application/json", ...options.headers };

  const url = apiUrl(path);

  try {
    const response = await fetch(url, {
      ...requestOptions,
      credentials: "include",
      headers,
    });

    if (!response.ok && response.status !== 304) {
      if (response.status === 401 && isGodApiPath(path)) redirectToGodLogin();
      const body: unknown = await response.json().catch(() => null);
      if (throwOnError) throw new CareerApiError(response.status, body);
      const errorData = (body && typeof body === "object" ? body : {}) as {
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
