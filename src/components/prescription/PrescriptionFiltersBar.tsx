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
import { useState, useEffect } from "react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export interface PrescriptionFilterValues {
  status?: string;
  fromDate?: string;
  toDate?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: string;
  hasNotes?: string;
  code?: string;
  consumedFromDate?: string;
  consumedToDate?: string;
  patientEmail?: string;
  doctorEmail?: string;
}

interface PrescriptionFiltersBarProps {
  values: PrescriptionFilterValues;
  onChange: (patch: Partial<PrescriptionFilterValues>) => void;
  onClear: () => void;
  role?: "ADMIN" | "DOCTOR" | "PATIENT";
}

export function PrescriptionFiltersBar({
  values,
  onChange,
  onClear,
  role = "ADMIN",
}: PrescriptionFiltersBarProps) {
  const [qLocal, setQLocal] = useState(values.q ?? "");
  const debouncedQ = useDebouncedValue(qLocal, 400);

  useEffect(() => {
    const nextQ = debouncedQ.trim() || undefined;
    const currentQ = values.q?.trim() || undefined;
    if (nextQ === currentQ) return;
    onChange({ q: nextQ });
  }, [debouncedQ, onChange, values.q]);

  if (role === "PATIENT") {
    return (
      <Card className="card-glass p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-8 flex flex-col gap-1.5">
            <Label htmlFor="search-patient" className="label-uppercase">
              Search
            </Label>
            <Input
              id="search-patient"
              type="search"
              placeholder="Medication or notes"
              value={qLocal}
              onChange={(e) => setQLocal(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 flex">
            <Button type="button" variant="outline" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (role === "DOCTOR") {
    return (
      <Card className="card-glass p-4 md:p-5 mb-4 rounded-2xl border border-outline-variant/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="search-doctor" className="label-uppercase">
              Search
            </Label>
            <Input
              id="search-doctor"
              type="search"
              placeholder="Notes, medication"
              value={qLocal}
              onChange={(e) => setQLocal(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status-doctor" className="label-uppercase">
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
              <SelectTrigger id="status-doctor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONSUMED">Consumed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">From</Label>
            <Input
              type="date"
              value={values.fromDate ?? ""}
              onChange={(e) =>
                onChange({ fromDate: e.target.value || undefined })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">To</Label>
            <Input
              type="date"
              value={values.toDate ?? ""}
              onChange={(e) =>
                onChange({ toDate: e.target.value || undefined })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Sort</Label>
            <Select
              value={values.sortBy ?? "__NONE__"}
              onValueChange={(v) =>
                onChange({
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
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="code">Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Notes</Label>
            <Select
              value={values.hasNotes ?? "__ALL__"}
              onValueChange={(v) =>
                onChange({
                  hasNotes: v === "__ALL__" ? undefined : (v ?? undefined),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All</SelectItem>
                <SelectItem value="true">Has notes</SelectItem>
                <SelectItem value="false">No notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Order</Label>
            <div className="flex gap-2">
              {(["asc", "desc"] as const).map((o) => (
                <Button
                  key={o}
                  type="button"
                  variant={values.sortOrder === o ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onChange({
                      sortOrder: values.sortOrder === o ? undefined : o,
                    })
                  }
                >
                  {o === "asc" ? "↑" : "↓"}
                </Button>
              ))}
            </div>
          </div>
          <div className="md:col-span-1 flex items-end">
            <Button type="button" variant="outline" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-glass p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search-admin" className="label-uppercase">
            Search
          </Label>
          <Input
            id="search-admin"
            type="search"
            placeholder="Notes, medication"
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status-admin" className="label-uppercase">
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
            <SelectTrigger id="status-admin">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONSUMED">Consumed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">RX Code</Label>
          <Input
            type="search"
            placeholder="e.g. RX-AB"
            value={values.code ?? ""}
            onChange={(e) => onChange({ code: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">From</Label>
          <Input
            type="date"
            value={values.fromDate ?? ""}
            onChange={(e) =>
              onChange({ fromDate: e.target.value || undefined })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">To</Label>
          <Input
            type="date"
            value={values.toDate ?? ""}
            onChange={(e) => onChange({ toDate: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">Consumed From</Label>
          <Input
            type="date"
            value={values.consumedFromDate ?? ""}
            onChange={(e) =>
              onChange({
                consumedFromDate: e.target.value || undefined,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">Consumed To</Label>
          <Input
            type="date"
            value={values.consumedToDate ?? ""}
            onChange={(e) =>
              onChange({ consumedToDate: e.target.value || undefined })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">Patient Email</Label>
          <Input
            type="search"
            placeholder="patient@email"
            value={values.patientEmail ?? ""}
            onChange={(e) =>
              onChange({ patientEmail: e.target.value || undefined })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">Doctor Email</Label>
          <Input
            type="search"
            placeholder="doctor@email"
            value={values.doctorEmail ?? ""}
            onChange={(e) =>
              onChange({ doctorEmail: e.target.value || undefined })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">Sort By</Label>
          <Select
            value={values.sortBy ?? "__NONE__"}
            onValueChange={(v) =>
              onChange({
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
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="consumedAt">Consumed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="label-uppercase">Has Notes</Label>
          <Select
            value={values.hasNotes ?? "__ALL__"}
            onValueChange={(v) =>
              onChange({
                hasNotes: v === "__ALL__" ? undefined : (v ?? undefined),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All</SelectItem>
              <SelectItem value="true">Has notes</SelectItem>
              <SelectItem value="false">No notes</SelectItem>
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
                  onChange({
                    sortOrder: values.sortOrder === o ? undefined : o,
                  })
                }
              >
                {o === "asc" ? "↑ Asc" : "↓ Desc"}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}
