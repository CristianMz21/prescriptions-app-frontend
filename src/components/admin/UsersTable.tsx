'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUsersFindAll } from '@/lib/api/generated/prescriptionManagementAPI'
import type { UserEntity } from '@/lib/api/generated/schemas'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { usePagination } from '@/lib/hooks/usePagination'
import { routes } from '@/lib/routes'

export function UsersTable() {
  const { page, limit, setPage } = usePagination({ limit: 20 })
  const { data, isLoading, error } = useUsersFindAll({ page, limit })

  if (isLoading) return <LoadingState label="Loading users" />
  if (error) return <ErrorState message={error.message} />

  const users = (data?.data as UserEntity[] | undefined) ?? []
  const meta = data?.meta

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Users</h2>
          <p className="text-base text-on-surface-variant mt-1">
            Every account in the system, paginated.
          </p>
        </div>
        <Link href={routes.admin.newUser} className={buttonVariants()}>
          <span className="material-symbols-outlined text-lg">person_add</span>
          New User
        </Link>
      </div>

      {users.length === 0 ? (
        <EmptyState icon="group" title="No users" />
      ) : (
        <Card className="card-glass overflow-hidden p-0 gap-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-outline-variant/30 bg-surface-container-lowest/50">
                <TableHead className="uppercase tracking-wider text-xs">Email</TableHead>
                <TableHead className="uppercase tracking-wider text-xs">Role</TableHead>
                <TableHead className="uppercase tracking-wider text-xs">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  data-testid="user-row"
                  className="hover:bg-surface-variant/20 transition-colors border-b border-outline-variant/20"
                >
                  <TableCell className="text-sm text-primary">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase tracking-wider text-[0.7rem]">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta ? (
            <div className="border-t border-outline-variant/30 p-4 flex items-center justify-between bg-surface-container-lowest/30">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Showing {users.length} of {meta.total}
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
