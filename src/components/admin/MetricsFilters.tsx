"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface MetricsFilterValues {
  fromDate?: string;
  toDate?: string;
}

type MetricsFiltersProps = Readonly<{
  values: MetricsFilterValues;
  onChange: (patch: Partial<MetricsFilterValues>) => void;
  onClear: () => void;
}>;

/**
 * Two `<input type="date">` controls that write the admin metrics
 * date range into the URL via `useUrlFilters`. URL is the source of
 * truth so refresh/back/forward survive the filter state. Pairs
 * with `MetricsContent`, which reads `values` from `useUrlFilters`
 * and forwards them to `useAdminGetMetrics({ fromDate, toDate })`.
 */
export function MetricsFilters({
  values,
  onChange,
  onClear,
}: MetricsFiltersProps) {
  const hasAny = Boolean(values.fromDate || values.toDate);
  return (
    <Card
      className="card-glass p-4 md:p-5 rounded-2xl border border-outline-variant/30"
      data-testid="metrics-filters"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="metrics-from-date" className="label-uppercase">
            From date
          </Label>
          <Input
            id="metrics-from-date"
            data-testid="metrics-from-date"
            type="date"
            value={values.fromDate ?? ""}
            onChange={(e) =>
              onChange({ fromDate: e.target.value || undefined })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="metrics-to-date" className="label-uppercase">
            To date
          </Label>
          <Input
            id="metrics-to-date"
            data-testid="metrics-to-date"
            type="date"
            value={values.toDate ?? ""}
            onChange={(e) =>
              onChange({ toDate: e.target.value || undefined })
            }
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            disabled={!hasAny}
            onClick={onClear}
            data-testid="metrics-filters-clear"
          >
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}
