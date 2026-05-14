import type { ReactNode } from 'react'

interface ErrorStateProps {
  message: string
  action?: ReactNode
  className?: string
}

export function ErrorState({ message, action, className }: ErrorStateProps) {
  return (
    <div
      className={
        className ??
        'flex flex-col items-center justify-center h-64 gap-4 text-error'
      }
      role="alert"
      data-testid="error-state"
    >
      <span className="material-symbols-outlined text-4xl">error</span>
      <p className="text-sm">{message}</p>
      {action}
    </div>
  )
}
