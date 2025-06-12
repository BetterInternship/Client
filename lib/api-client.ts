// HTTP client with auth handling
class FetchClient {
  private async request<T>(
    url: string,
    options: RequestInit = {},
    type: string = "json"
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        console.warn(`${url}: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
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
      type
    );
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "DELETE" });
  }

  async uploadFile<T>(url: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {};
    const config: RequestInit = {
      method: "POST",
      headers,
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    }
  }
}

export const APIClient = new FetchClient();

// API response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Error handling
export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}
