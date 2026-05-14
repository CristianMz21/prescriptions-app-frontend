'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
}

interface NavItem {
  href: string
  label: string
  icon: string
}

const navigationByRole: Record<SidebarProps['role'], NavItem[]> = {
  ADMIN: [
    { href: '/admin/metrics', label: 'Analytics', icon: 'monitoring' },
    { href: '/admin/prescriptions', label: 'Prescriptions', icon: 'medication' },
    { href: '/admin/users', label: 'Users', icon: 'group' },
  ],
  DOCTOR: [
    { href: '/doctor/prescriptions', label: 'Prescriptions', icon: 'medication' },
    { href: '/doctor/patients', label: 'Patients', icon: 'group' },
    { href: '/doctor/analytics', label: 'Analytics', icon: 'monitoring' },
  ],
  PATIENT: [
    { href: '/patient/prescriptions', label: 'My Prescriptions', icon: 'medication' },
    { href: '/patient/profile', label: 'Profile', icon: 'account_circle' },
  ],
}

export function Sidebar({ role }: SidebarProps) {
  const { logout } = useAuth()
  const pathname = usePathname()
  const navItems = navigationByRole[role]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 card-glass z-50 flex flex-col py-margin-desktop border-r border-outline-variant/30">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-primary uppercase tracking-widest">RX-OS</h1>
        <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider">Precision Control</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 pl-4 py-2 rounded transition-colors ${
                isActive
                  ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-high/50 scale-95'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-2 mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-1">
        <Link
          href="/support"
          className="flex items-center gap-3 pl-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 rounded transition-colors"
        >
          <span className="material-symbols-outlined text-xl">help_outline</span>
          <span className="text-sm font-medium">Support</span>
        </Link>
        <button
          onClick={() => void logout()}
          className="flex items-center gap-3 pl-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 rounded transition-colors w-full text-left"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}