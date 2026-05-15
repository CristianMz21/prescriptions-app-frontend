import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface PageShellProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <section
      {...props}
      className={cn(
        "mx-auto w-full max-w-[1440px] px-2 md:px-4 lg:px-6 space-y-6 md:space-y-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
