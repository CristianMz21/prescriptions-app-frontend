import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={
        className ??
        "flex flex-col items-center justify-center h-64 gap-3 text-on-surface-variant"
      }
    >
      <span className="material-symbols-outlined text-6xl">{icon}</span>
      <p className="text-sm font-medium text-on-surface">{title}</p>
      {description ? (
        <p className="text-xs uppercase tracking-widest">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
