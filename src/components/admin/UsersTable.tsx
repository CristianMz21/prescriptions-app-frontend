"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsersFindAll } from "@/lib/api/generated/prescriptionManagementAPI";
import type {
  UserEntity,
  UsersFindAllParams,
  Role,
  ThemePreference,
} from "@/lib/api/generated/schemas";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePagination } from "@/lib/hooks/usePagination";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";
import { routes } from "@/lib/routes";
import { UrlSortableHeader } from "@/components/filters/SortableHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const FILTER_KEYS = [
  "q",
  "role",
  "createdFromDate",
  "createdToDate",
  "themePreference",
  "sortBy",
  "sortOrder",
] as const;

const ROLE_OPTIONS = ["ADMIN", "DOCTOR", "PATIENT"] as const;
const THEME_OPTIONS = ["LIGHT", "DARK", "SYSTEM"] as const;

export function UsersTable() {
  const { page, limit, setPage } = usePagination({ limit: 20 });
  const { values, setFilters, clear } =
    useUrlFilters<(typeof FILTER_KEYS)[number]>(FILTER_KEYS);

  const params: UsersFindAllParams = {
    page,
    limit,
    q: values.q,
    role: values.role as Role | undefined,
    createdFromDate: values.createdFromDate,
    createdToDate: values.createdToDate,
    themePreference: values.themePreference as ThemePreference | undefined,
    sortBy: values.sortBy as UsersFindAllParams["sortBy"] | undefined,
    sortOrder: values.sortOrder as UsersFindAllParams["sortOrder"] | undefined,
  };

  const { data, isLoading, error } = useUsersFindAll(params);

  const users = (data?.data as UserEntity[] | undefined) ?? [];
  const meta = data?.meta;

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

      <Card className="card-glass p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-search" className="label-uppercase">
              Search
            </Label>
            <Input
              id="user-search"
              type="search"
              placeholder="Name or email"
              value={values.q ?? ""}
              onChange={(e) => setFilters({ q: e.target.value || undefined })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Role</Label>
            <Select
              value={values.role ?? "__ALL__"}
              onValueChange={(v) =>
                setFilters({
                  role: v === "__ALL__" ? undefined : (v as Role),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All</SelectItem>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Created From</Label>
            <Input
              type="date"
              value={values.createdFromDate ?? ""}
              onChange={(e) =>
                setFilters({ createdFromDate: e.target.value || undefined })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Created To</Label>
            <Input
              type="date"
              value={values.createdToDate ?? ""}
              onChange={(e) =>
                setFilters({ createdToDate: e.target.value || undefined })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Theme</Label>
            <Select
              value={values.themePreference ?? "__ALL__"}
              onValueChange={(v) =>
                setFilters({
                  themePreference:
                    v === "__ALL__" ? undefined : (v as ThemePreference),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All</SelectItem>
                {THEME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Sort By</Label>
            <Select
              value={values.sortBy ?? "__NONE__"}
              onValueChange={(v) =>
                setFilters({
                  sortBy: v === "__NONE__" ? undefined : (v ?? undefined),
                  sortOrder:
                    v !== "__NONE__" ? (values.sortOrder ?? "asc") : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">— None —</SelectItem>
                <SelectItem value="createdAt">Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role">Role</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Order</Label>
            <div className="flex gap-1">
              {(["asc", "desc"] as const).map((o) => (
                <Button
                  key={o}
                  type="button"
                  variant={values.sortOrder === o ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilters({
                      sortOrder: values.sortOrder === o ? undefined : o,
                    })
                  }
                >
                  {o === "asc" ? "↑ Asc" : "↓ Desc"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex mt-3">
          <Button type="button" variant="outline" onClick={clear}>
            Clear
          </Button>
        </div>
      </Card>

      {isLoading ? <LoadingState label="Loading users" /> : null}
      {error ? <ErrorState message={error.message} /> : null}

      {users.length === 0 && !isLoading && !error ? (
        <EmptyState icon="users" title="No users match these filters" />
      ) : (
        <Card className="card-glass overflow-hidden p-0 gap-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-outline-variant/30 bg-surface-container-lowest/50">
                <UrlSortableHeader sortBy="name">User</UrlSortableHeader>
                <TableCell className="label-uppercase tracking-widest text-[0.65rem] py-3">
                  Phone
                </TableCell>
                <UrlSortableHeader sortBy="role">Role</UrlSortableHeader>
                <UrlSortableHeader sortBy="createdAt">
                  Created
                </UrlSortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  data-testid="user-row"
                  className="hover:bg-surface-variant/20 transition-colors border-b border-outline-variant/20"
                >
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary">
                        {user.name}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-on-surface tabular-nums">
                    {user.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="uppercase tracking-wider text-[0.7rem]"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-on-surface-variant">
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
                  <span className="material-symbols-outlined text-lg">
                    chevron_left
                  </span>
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
                  <span className="material-symbols-outlined text-lg">
                    chevron_right
                  </span>
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
