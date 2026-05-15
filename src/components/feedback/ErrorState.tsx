import type { ReactNode } from "react";
import { AppIcon } from "@/components/icons/AppIcon";

interface ErrorStateProps {
  message: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({ message, action, className }: ErrorStateProps) {
  return (
    <div
      className={
        className ??
        "flex flex-col items-center justify-center h-64 gap-4 text-error"
      }
      role="alert"
      data-testid="error-state"
    >
      <AppIcon name="shieldAlert" size="xl" className="text-error" />
      <p className="text-sm">{message}</p>
      {action}
    </div>
  );
}
