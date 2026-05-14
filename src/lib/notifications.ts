import { toast } from 'sonner'
import { ApiError } from './api/client'
import type { ErrorResponseDto } from './api/generated/schemas'

export const notify = {
  success(message: string, description?: string) {
    toast.success(message, { description })
  },
  error(message: string, description?: string) {
    toast.error(message, { description })
  },
  info(message: string, description?: string) {
    toast(message, { description })
  },
  /**
   * Translate a thrown axios/fetch error into a user-visible toast.
   * Backend errors come back as ErrorResponseDto via ApiError; everything else
   * gets a generic fallback so we never leak stack traces.
   */
  apiError(err: unknown, fallback = 'Unexpected error') {
    if (err instanceof ApiError) {
      toast.error(err.message || fallback, {
        description: err.path ? `${err.status} · ${err.path}` : `${err.status}`,
      })
      return
    }
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = String((err as { message?: unknown }).message ?? fallback)
      toast.error(msg)
      return
    }
    toast.error(fallback)
  },
}

export type { ErrorResponseDto }
