'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { MetricsResponseDto } from '@/lib/api/generated/schemas'
import { API_BASE_URL } from '@/lib/api/client'
import { qk } from '@/lib/api/queryKeys'

/**
 * Subscribes to /admin/metrics/stream and feeds each event payload into the
 * existing useAdminControllerGetMetrics cache via setQueryData. The HTTP
 * polling hook stays in place as the canonical source — this hook only
 * accelerates updates while a tab is open.
 *
 * Falls back to a no-op if EventSource isn't available (e.g. SSR / older
 * browsers); the polling hook still works in that case.
 */
export function useMetricsStream(enabled = true): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return

    const url = `${API_BASE_URL}/admin/metrics/stream`
    let es: EventSource | null = null
    try {
      es = new EventSource(url, { withCredentials: true })
    } catch {
      return
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as MetricsResponseDto
        queryClient.setQueryData(qk.metrics.summary(), payload)
      } catch {
        /* malformed event — ignore */
      }
    }
    const handleError = () => {
      // SSE errors auto-reconnect; if the endpoint is missing/forbidden the
      // polling hook still keeps the cache fresh. We do nothing here so a
      // missing /admin/metrics/stream endpoint cannot crash the page.
    }

    es.addEventListener('message', handleMessage)
    es.addEventListener('error', handleError)

    return () => {
      try {
        es?.removeEventListener('message', handleMessage)
        es?.removeEventListener('error', handleError)
        es?.close()
      } catch {
        /* ignore — already torn down */
      }
    }
  }, [enabled, queryClient])
}
