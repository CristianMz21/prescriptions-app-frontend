import { requireRole } from '@/lib/auth/server'
import { Sidebar } from '@/components/layouts/Sidebar'
import { MetricsContent } from './MetricsContent'

export default async function AdminMetricsPage() {
  await requireRole(['ADMIN'])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="ADMIN" />
      <main className="flex-1 ml-64 p-margin-desktop">
        <MetricsContent />
      </main>
    </div>
  )
}