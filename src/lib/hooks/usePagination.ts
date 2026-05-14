'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PaginationState {
  page: number
  limit: number
}

interface PaginationApi extends PaginationState {
  setPage: (page: number) => void
  setLimit: (limit: number) => void
}

const DEFAULT_LIMIT = 10

/**
 * URL-synced pagination state. Reads ?page= and ?limit= from the current URL,
 * exposes setters that push a new URL (so refresh/back/forward survive the
 * pagination state).
 */
export function usePagination(defaults?: Partial<PaginationState>): PaginationApi {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()

  const page = useMemo(() => {
    const raw = Number(params.get('page'))
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : defaults?.page ?? 1
  }, [params, defaults?.page])

  const limit = useMemo(() => {
    const raw = Number(params.get('limit'))
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : defaults?.limit ?? DEFAULT_LIMIT
  }, [params, defaults?.limit])

  const update = useCallback(
    (patch: Partial<PaginationState>) => {
      const next = new URLSearchParams(params.toString())
      if (patch.page !== undefined) next.set('page', String(patch.page))
      if (patch.limit !== undefined) {
        next.set('limit', String(patch.limit))
        next.set('page', '1')
      }
      router.push(`${pathname}?${next.toString()}`)
    },
    [params, pathname, router],
  )

  return {
    page,
    limit,
    setPage: (p) => update({ page: p }),
    setLimit: (l) => update({ limit: l }),
  }
}
