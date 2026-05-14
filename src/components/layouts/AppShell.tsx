import type { ReactNode } from "react";
import type { Role } from "@/lib/api/generated/schemas";
import { Sidebar } from "./Sidebar";
import { MobileTopBar } from "./MobileTopBar";

interface AppShellProps {
  role: Role;
  children: ReactNode;
}

export function AppShell({ role, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar role={role} />
      </div>
      <div className="flex-1 flex flex-col md:ml-64">
        <MobileTopBar role={role} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
