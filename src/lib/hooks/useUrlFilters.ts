'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * Generic typed string-keyed URL search-params binding. Consumers map domain
 * filters (status, fromDate, toDate, q, sort, ...) to URL params with read +
 * patch helpers; the URL stays the source of truth.
 */
export function useUrlFilters<TKeys extends string>(allowedKeys: readonly TKeys[]) {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()

  const values = useMemo(() => {
    const out = {} as Partial<Record<TKeys, string>>
    for (const key of allowedKeys) {
      const v = params.get(key)
      if (v !== null && v !== '') out[key] = v
    }
    return out
  }, [params, allowedKeys])

  const setFilters = useCallback(
    (patch: Partial<Record<TKeys, string | undefined>>) => {
      const next = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === '') next.delete(k)
        else next.set(k, String(v))
      }
      // any filter change resets pagination — page=1 is the safe default.
      next.set('page', '1')
      router.push(`${pathname}?${next.toString()}`)
    },
    [params, pathname, router],
  )

  const clear = useCallback(() => {
    router.push(pathname)
  }, [pathname, router])

  return { values, setFilters, clear }
}
