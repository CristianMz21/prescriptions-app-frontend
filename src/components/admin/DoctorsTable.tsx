'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useUsersFindAllDoctors } from '@/lib/api/generated/prescriptionManagementAPI'
import type { UserEntity } from '@/lib/api/generated/schemas'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { usePagination } from '@/lib/hooks/usePagination'

type DoctorRow = UserEntity

// The Orval schema models specialty / medicalId as opaque-record-or-null;
// in practice the backend returns a string. Coerce safely for display.
function stringifyOptional(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'string') return value
  return String(value)
}

export function DoctorsTable() {
  const { page, limit, setPage } = usePagination({ limit: 20 })
  const { data, isLoading, error } = useUsersFindAllDoctors({ page, limit })

  if (isLoading) return <LoadingState label="Loading doctors" />
  if (error) return <ErrorState message={error.message} />

  const doctors = (data?.data as DoctorRow[] | undefined) ?? []
  const meta = data?.meta

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary">Doctors</h2>
        <p className="text-base text-on-surface-variant mt-1">
          All practitioners with prescribing privileges.
        </p>
      </div>

      {doctors.length === 0 ? (
        <EmptyState icon="local_hospital" title="No doctors" />
      ) : (
        <Card className="card-glass overflow-hidden p-0 gap-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-outline-variant/30 bg-surface-container-lowest/50">
                <TableHead className="uppercase tracking-wider text-xs">Email</TableHead>
                <TableHead className="uppercase tracking-wider text-xs">Specialty</TableHead>
                <TableHead className="uppercase tracking-wider text-xs">Medical ID</TableHead>
                <TableHead className="uppercase tracking-wider text-xs">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((u) => (
                <TableRow
                  key={u.id}
                  data-testid="doctor-row"
                  className="hover:bg-surface-variant/20 transition-colors border-b border-outline-variant/20"
                >
                  <TableCell className="text-sm text-primary">{u.email}</TableCell>
                  <TableCell className="text-sm">{stringifyOptional(u.doctor?.specialty)}</TableCell>
                  <TableCell className="text-sm font-mono">{stringifyOptional(u.doctor?.medicalId)}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta ? (
            <div className="border-t border-outline-variant/30 p-4 flex items-center justify-between bg-surface-container-lowest/30">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Showing {doctors.length} of {meta.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={meta.page <= 1}
                  onClick={() => setPage(meta.page - 1)}
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </Button>
                <div className="text-xs font-semibold tabular-nums">
                  Page {meta.page} of {meta.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage(meta.page + 1)}
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  )
}
