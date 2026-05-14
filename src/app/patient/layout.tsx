import { requireRole } from '@/lib/auth/server'
import { Sidebar } from '@/components/layouts/Sidebar'

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['PATIENT'])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="PATIENT" />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  )
}