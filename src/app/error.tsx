'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { routes } from '@/lib/routes'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('GlobalError boundary:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-margin-desktop bg-background">
      <span className="material-symbols-outlined text-7xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
        error
      </span>
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-widest">System fault</h1>
        <p className="text-base text-on-surface-variant mt-2">
          {error.message || 'An unexpected error occurred while rendering this page.'}
        </p>
        {error.digest ? (
          <p className="text-xs font-mono text-on-surface-variant mt-2">ref · {error.digest}</p>
        ) : null}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className={buttonVariants({ variant: 'outline' })}>
          <span className="material-symbols-outlined text-base">refresh</span>
          Retry
        </button>
        <Link href={routes.login} className={buttonVariants()}>
          <span className="material-symbols-outlined text-base">home</span>
          Back to sign-in
        </Link>
      </div>
    </div>
  )
}
