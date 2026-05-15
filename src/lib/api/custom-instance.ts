import axios, { type AxiosRequestConfig, AxiosError } from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const BROWSER_API_PROXY_BASE_URL = "/api/backend";
const runtimeBaseUrl =
  typeof window === "undefined" ? API_BASE_URL : BROWSER_API_PROXY_BASE_URL;

export const apiClient = axios.create({
  baseURL: runtimeBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly path?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Endpoints whose 401 must NOT trigger a refresh attempt — refreshing them
// would either loop infinitely or overwrite a deliberate logout.
const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/auth/profile",
];

function isAuthRequest(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

// Single in-flight refresh promise so concurrent 401s coalesce into one
// /auth/refresh call. After settle, the next 401 starts a fresh attempt.
let inflightRefresh: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  if (inflightRefresh) return inflightRefresh;
  inflightRefresh = apiClient
    .post("/auth/refresh", {}, {
      _skipAuthInterceptor: true,
    } as AxiosRequestConfig)
    .then(() => undefined)
    .finally(() => {
      inflightRefresh = null;
    });
  return inflightRefresh;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as
      | (AxiosRequestConfig & {
          _retry?: boolean;
          _skipAuthInterceptor?: boolean;
        })
      | undefined;
    const status = error.response?.status;

    // Try a one-shot refresh + replay only when:
    // - the original call returned 401
    // - it wasn't an auth endpoint itself (avoid loops)
    // - we haven't already retried this request
    // - the call wasn't explicitly opted out (the refresh call itself uses this flag)
    if (
      status === 401 &&
      config &&
      !config._retry &&
      !config._skipAuthInterceptor &&
      !isAuthRequest(config.url)
    ) {
      try {
        await refreshSession();
        config._retry = true;
        return apiClient.request(config);
      } catch {
        // Fall through to ApiError below — refresh failed, the user is
        // genuinely unauthenticated. UI layer (route guards) will redirect.
      }
    }

    if (error.response) {
      const data = error.response.data as { message?: string } | undefined;
      const message: string =
        data?.message || error.response.statusText || "Request failed";
      throw new ApiError(error.response.status, message, error.config?.url);
    }
    throw error;
  },
);

/**
 * Orval mutator entry point.
 *
 * Orval generates hooks and fetchers that call this function with an
 * Axios-shaped request config. We delegate to {@link apiClient} so that
 * baseURL, credentials, and interceptors (ApiError mapping + 401 refresh)
 * are applied consistently across every generated call site.
 */
export const customInstance = async <T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiClient.request<T>(config);
  return response.data;
};

export default customInstance;
