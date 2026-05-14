'use client'

import { useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

/**
 * Migrates legacy ?from= and ?to= query params to ?fromDate= and ?toDate=
 * on the /admin/prescriptions page. Runs once on mount to handle old bookmarks
 * and shared URLs. Only applies on the admin prescriptions route.
 */
export function useLegacyUrlMigration() {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (!pathname.includes('/admin/prescriptions')) return

    const hasLegacyFrom = params.has('from')
    const hasLegacyTo = params.has('to')

    if (!hasLegacyFrom && !hasLegacyTo) return

    const next = new URLSearchParams(params.toString())

    if (hasLegacyFrom) {
      next.set('fromDate', params.get('from')!)
      next.delete('from')
    }
    if (hasLegacyTo) {
      next.set('toDate', params.get('to')!)
      next.delete('to')
    }

    router.replace(`${pathname}?${next.toString()}`)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- runs once on mount
}