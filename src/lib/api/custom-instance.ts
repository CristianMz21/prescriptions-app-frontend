import axios, { AxiosRequestConfig } from 'axios'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly path?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message: string =
        error.response.data?.message || error.response.statusText
      throw new ApiError(error.response.status, message, error.config?.url)
    }
    throw error
  },
)

/**
 * Orval mutator entry point.
 *
 * Orval generates hooks and fetchers that call this function with an
 * Axios-shaped request config. We delegate to {@link apiClient} so that
 * baseURL, credentials, and interceptors (ApiError mapping) are applied
 * consistently across every generated call site.
 */
export const customInstance = async <T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiClient.request<T>(config)
  return response.data
}

export default customInstance
