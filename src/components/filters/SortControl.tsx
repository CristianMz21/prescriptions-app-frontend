"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { sortOrderOptions, type SortOrder } from "@/lib/config/sort-config";

interface SortControlProps<T extends string> {
  sortByValue?: string;
  sortOrderValue?: SortOrder;
  sortOptions: readonly T[];
  optionLabels?: Record<string, string>;
  onSortByChange: (value: T | undefined) => void;
  onSortOrderChange: (value: SortOrder | undefined) => void;
}

export function SortControl<T extends string>({
  sortByValue,
  sortOrderValue,
  sortOptions,
  optionLabels,
  onSortByChange,
  onSortOrderChange,
}: SortControlProps<T>) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <Label className="label-uppercase">Sort by</Label>
        <Select
          value={sortByValue ?? "__NONE__"}
          onValueChange={(v) =>
            onSortByChange(v === "__NONE__" ? undefined : (v as T))
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__NONE__">— None —</SelectItem>
            {sortOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {optionLabels?.[opt] ?? opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="label-uppercase">Order</Label>
        <div className="flex gap-1">
          {sortOrderOptions.map((order) => (
            <Button
              key={order}
              type="button"
              variant={sortOrderValue === order ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onSortOrderChange(sortOrderValue === order ? undefined : order)
              }
            >
              {order === "asc" ? "↑ Asc" : "↓ Desc"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
