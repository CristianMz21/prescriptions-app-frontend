"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PrescriptionFilterValues {
  status?: string;
  fromDate?: string;
  toDate?: string;
  q?: string;
}

interface PrescriptionFiltersBarProps {
  values: PrescriptionFilterValues;
  onChange: (patch: Partial<PrescriptionFilterValues>) => void;
  onClear: () => void;
}

export function PrescriptionFiltersBar({
  values,
  onChange,
  onClear,
}: PrescriptionFiltersBarProps) {
  return (
    <Card className="card-glass p-4 gap-0 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <Label htmlFor="filter-q" className="label-uppercase">
            Search
          </Label>
          <Input
            id="filter-q"
            type="search"
            placeholder="Notes or medication name"
            value={values.q ?? ""}
            onChange={(e) => onChange({ q: e.target.value || undefined })}
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="filter-status" className="label-uppercase">
            Status
          </Label>
          <Select
            value={values.status ?? "__ALL__"}
            onValueChange={(v) =>
              onChange({
                status: v === "__ALL__" ? undefined : (v ?? undefined),
              })
            }
          >
            <SelectTrigger id="filter-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONSUMED">Consumed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <Label htmlFor="filter-from" className="label-uppercase">
            From
          </Label>
          <Input
            id="filter-from"
            type="date"
            value={values.fromDate ?? ""}
            onChange={(e) =>
              onChange({ fromDate: e.target.value || undefined })
            }
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="filter-to" className="label-uppercase">
            To
          </Label>
          <Input
            id="filter-to"
            type="date"
            value={values.toDate ?? ""}
            onChange={(e) => onChange({ toDate: e.target.value || undefined })}
          />
        </div>
        <div className="md:col-span-1 flex">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}
