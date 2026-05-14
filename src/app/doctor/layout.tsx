import { requireRole } from '@/lib/auth/server'
import { Sidebar } from '@/components/layouts/Sidebar'

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['DOCTOR'])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="DOCTOR" />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  )
}