'use client'

import Link from 'next/link'
import type { PrescriptionResponseDto } from '@/lib/api/generated/schemas'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button, buttonVariants } from '@/components/ui/button'
import { PrescriptionStatusBadge } from './PrescriptionStatusBadge'

interface Pagination {
  page: number
  totalPages: number
  total: number
}

interface PrescriptionTableProps {
  prescriptions: PrescriptionResponseDto[]
  getDetailHref: (id: string) => string
  meta?: Pagination
}

export function PrescriptionTable({
  prescriptions,
  getDetailHref,
  meta,
}: PrescriptionTableProps) {
  return (
    <div className="card-glass overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-outline-variant/30 bg-surface-container-lowest/50">
              <TableHead className="uppercase tracking-wider text-xs">Patient</TableHead>
              <TableHead className="uppercase tracking-wider text-xs">RX Code</TableHead>
              <TableHead className="uppercase tracking-wider text-xs">Medications</TableHead>
              <TableHead className="uppercase tracking-wider text-xs">Status</TableHead>
              <TableHead className="uppercase tracking-wider text-xs">Date</TableHead>
              <TableHead className="text-right uppercase tracking-wider text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((rx) => (
              <TableRow
                key={rx.id}
                data-testid="prescription-row"
                data-rx-code={rx.code}
                className="hover:bg-surface-variant/20 transition-colors border-b border-outline-variant/20"
              >
                <TableCell className="text-sm font-medium text-primary">
                  {rx.patient?.user?.email ?? 'N/A'}
                </TableCell>
                <TableCell className="text-sm font-mono">{rx.code}</TableCell>
                <TableCell className="text-sm">
                  {rx.items?.map((item) => item.name).join(', ') || 'N/A'}
                </TableCell>
                <TableCell>
                  <PrescriptionStatusBadge status={rx.status} />
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {new Date(rx.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={getDetailHref(rx.id)}
                    aria-label={`View ${rx.code}`}
                    className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                  >
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta ? (
        <div className="border-t border-outline-variant/30 p-4 flex items-center justify-between bg-surface-container-lowest/30">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Showing {prescriptions.length} of {meta.total}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" disabled={meta.page <= 1} aria-label="Previous page">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </Button>
            <div className="text-xs font-semibold tabular-nums">
              Page {meta.page} of {meta.totalPages}
            </div>
            <Button variant="outline" size="icon-sm" disabled={meta.page >= meta.totalPages} aria-label="Next page">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
