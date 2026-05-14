'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import type { Role } from '@/lib/api/generated/schemas'
import { navigationByRole } from '@/lib/nav'
import { RoleNav } from './RoleNav'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const { logout, user } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 card-glass z-50 flex flex-col py-margin-desktop border-r border-outline-variant/30">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-primary uppercase tracking-widest">RX-OS</h1>
        <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
          Precision Control
        </p>
      </div>

      <RoleNav items={navigationByRole[role]} />

      <div className="px-6 mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
        {user ? (
          <div className="flex flex-col gap-0.5">
            <span
              data-testid="sidebar-user-role"
              className="text-xs font-semibold text-on-surface uppercase tracking-wider"
            >
              {user.role}
            </span>
            <span
              data-testid="sidebar-user-email"
              className="text-xs text-on-surface-variant truncate"
            >
              {user.email}
            </span>
          </div>
        ) : null}
        {user ? <ThemeToggle initial={user.themePreference} /> : null}
        <button
          type="button"
          data-testid="sidebar-logout"
          onClick={() => void logout()}
          className="flex items-center gap-3 py-2 text-on-surface-variant hover:text-on-surface transition-colors w-full text-left text-sm font-medium"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
