import type { ReactNode } from 'react'
import type { Role } from '@/lib/api/generated/schemas'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  role: Role
  children: ReactNode
}

export function AppShell({ role, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="flex-1 ml-64 p-margin-desktop">{children}</main>
    </div>
  )
}
