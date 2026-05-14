interface LoadingStateProps {
  label?: string
  className?: string
}

export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <div
      className={
        className ??
        'flex flex-col items-center justify-center h-64 gap-3 text-on-surface-variant'
      }
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">
        progress_activity
      </span>
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-widest">
          {label}
        </span>
      ) : null}
    </div>
  )
}
