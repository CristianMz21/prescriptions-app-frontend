import type { ReactNode } from "react";
import type { AppIconName } from "@/config/icon-registry";
import { AppIcon } from "@/components/icons/AppIcon";

interface EmptyStateProps {
  icon?: AppIconName;
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
      <AppIcon name={icon} className="size-12 md:size-14 text-on-surface-variant" />
      <p className="text-sm font-medium text-on-surface">{title}</p>
      {description ? (
        <p className="text-xs uppercase tracking-widest">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
