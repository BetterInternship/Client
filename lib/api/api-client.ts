// API configuration and helper funcs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) console.warn("[WARNING]: Base API URL is not set.");

interface Params {
  [key: string]: any;
}

/**
 * Creates parameter strings from param object
 *
 * @param params
 * @returns
 */
const createParameterString = (params: Params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      searchParams.append(key, value.toString());
  });
  return searchParams.toString();
};

/**
 * Builder class for routes.
 */
export const APIRouteBuilder = (() => {
  class APIRouteClass {
    routes: string[];
    params: Params | null;

    constructor(base: string) {
      this.routes = [base];
      this.params = null;
    }

    // Adds a subroute
    r(...route: string[]) {
      route.map((r) => this.routes.push(r));
      return this;
    }

    // Adds a list of params
    p(params: Params) {
      this.params = params;
      return this;
    }

    build() {
      if (!this.params) return `${API_BASE_URL}/${this.routes.join("/")}`;
      return `${API_BASE_URL}/${this.routes.join("/")}?${createParameterString(
        this.params,
      )}`;
    }
  }

  return (route: string) => new APIRouteClass(route);
})();

/**
 * Utility we can use for making server requests.
 */
class FetchClient {
  private async request<T>(
    url: string,
    options: RequestInit = {},
    type: string = "json",
  ): Promise<T> {
    const headers: HeadersInit =
      type === "json"
        ? {
            "Content-Type": "application/json",
            ...options.headers,
          }
        : { ...options.headers };

    const config: RequestInit = {
      ...options,
      credentials: "include",
      headers,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok && response.status !== 304) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`${url}: ${errorData.message || response.status}`);
        return { error: errorData.message } as T;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as unknown as T;
      }
      return (await response.text()) as unknown as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(url: string, data?: any, type: string = "json"): Promise<T> {
    return this.request<T>(
      url,
      {
        method: "POST",
        body: data
          ? type === "json"
            ? JSON.stringify(data)
            : data
          : undefined,
      },
      type,
    );
  }

  async put<T>(url: string, data?: any, type: string = "json"): Promise<T> {
    return this.request<T>(
      url,
      {
        method: "PUT",
        body: data
          ? type === "json"
            ? JSON.stringify(data)
            : data
          : undefined,
      },
      type,
    );
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const APIClient = new FetchClient();
