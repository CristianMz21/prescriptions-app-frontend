import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DataTableShellProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function DataTableShell({ children, className }: DataTableShellProps) {
  return (
    <div
      className={cn(
        "card-glass rounded-2xl border border-outline-variant/30 overflow-hidden",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
