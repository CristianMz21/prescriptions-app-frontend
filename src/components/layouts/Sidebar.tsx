"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import type { Role } from "@/lib/api/generated/schemas";
import { navigationByRole } from "@/lib/nav";
import { RoleNav } from "./RoleNav";
import { ThemeToggle } from "./ThemeToggle";
import { AppIcon } from "@/components/icons/AppIcon";

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const { logout, user, isLoading } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 card-glass z-50 flex flex-col py-margin-desktop border-r border-outline-variant/30">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-primary uppercase tracking-widest">
          RX-OS
        </h1>
        <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
          Precision Control
        </p>
      </div>

      <RoleNav items={navigationByRole[role]} />

      <div className="px-6 mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
        {user ? (
          <div className="flex flex-col gap-0.5 mb-2">
            <span
              data-testid="sidebar-user-name"
              className="text-sm font-bold text-primary truncate"
            >
              {user.name}
            </span>
            <div className="flex items-center gap-2">
              <span
                data-testid="sidebar-user-role"
                className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest border border-outline-variant/30 px-1.5 rounded"
              >
                {user.role}
              </span>
              <span
                data-testid="sidebar-user-email"
                className="text-[0.65rem] text-on-surface-variant truncate font-mono"
              >
                {user.email}
              </span>
            </div>
          </div>
        ) : null}
        {user ? <ThemeToggle initial={user.themePreference} /> : null}
        <button
          type="button"
          data-testid="sidebar-logout"
          onClick={() => {
            if (isLoading) return;
            void logout();
          }}
          disabled={isLoading}
          aria-busy={isLoading}
          className="flex items-center gap-3 py-2 text-on-surface-variant hover:text-on-surface transition-colors w-full text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          <AppIcon name="logOut" size="md" />
          {isLoading ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
