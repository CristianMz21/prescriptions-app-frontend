"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortableHeaderProps = Readonly<{
  children: React.ReactNode;
  sortBy: string;
  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
  onSort?: (field: string, order: "asc" | "desc") => void;
}>;

export function SortableHeader({
  children,
  sortBy,
  currentSortBy,
  currentSortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSortBy === sortBy;

  const handleClick = () => {
    if (!onSort) return;
    if (isActive) {
      onSort(sortBy, currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(sortBy, "asc");
    }
  };

  return (
    <TableHead className="cursor-pointer select-none" onClick={handleClick}>
      <div className="flex items-center gap-1">
        {children}
        {isActive ? (
          <span className="material-symbols-outlined text-xs">
            {currentSortOrder === "asc" ? "expand_less" : "expand_more"}
          </span>
        ) : (
          <span className="material-symbols-outlined text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
            unfold_more
          </span>
        )}
      </div>
    </TableHead>
  );
}

type UrlSortableHeaderProps = Readonly<{
  children: React.ReactNode;
  sortBy: string;
  className?: string;
}>;

export function UrlSortableHeader({
  children,
  sortBy,
  className,
}: UrlSortableHeaderProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const currentSortBy = params.get("sortBy") ?? undefined;
  const currentSortOrder =
    (params.get("sortOrder") as "asc" | "desc") ?? undefined;
  const isActive = currentSortBy === sortBy;

  const handleClick = () => {
    const next = new URLSearchParams(params.toString());
    if (isActive) {
      if (currentSortOrder === "asc") {
        next.set("sortOrder", "desc");
      } else {
        next.delete("sortBy");
        next.delete("sortOrder");
      }
    } else {
      next.set("sortBy", sortBy);
      next.set("sortOrder", "asc");
    }
    next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <TableHead
      className={cn("cursor-pointer select-none", className)}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive ? (
          <span className="material-symbols-outlined text-xs">
            {currentSortOrder === "asc" ? "expand_less" : "expand_more"}
          </span>
        ) : (
          <span className="material-symbols-outlined text-xs text-muted-foreground">
            unfold_more
          </span>
        )}
      </div>
    </TableHead>
  );
}
