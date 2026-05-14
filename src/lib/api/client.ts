// Re-export the underlying axios instance + error type for server-side
// (Next.js route handlers, server components) usage that bypasses TanStack
// Query. Client components should import the generated React Query hooks
// (e.g. `useAuthControllerGetProfile`) directly.
export { apiClient, API_BASE_URL, ApiError } from './custom-instance'
