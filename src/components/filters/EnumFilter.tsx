"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { SelectRootChangeEventDetails } from "@base-ui/react/select";

export interface EnumFilterProps {
  label: string;
  value?: string;
  options: readonly string[];
  optionLabels?: Record<string, string>;
  onChange: (value: string | undefined) => void;
  allOption?: string;
  debounceMs?: number;
  placeholder?: string;
}

export function EnumFilter({
  label,
  value,
  options,
  optionLabels,
  onChange,
  allOption = "All",
  debounceMs,
  placeholder,
}: EnumFilterProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const debouncedValue = useDebouncedValue(localValue, debounceMs ?? 0);

  useEffect(() => {
    if (debounceMs && debouncedValue !== value) {
      onChange(debouncedValue || undefined);
    }
  }, [debouncedValue, debounceMs, onChange, value]);

  const handleChange = (v: string) => {
    const next = v === "__ALL__" ? "" : v;
    setLocalValue(next);
    if (!debounceMs) {
      onChange(next || undefined);
    }
  };

  const handleValueChange: (
    v: string | null,
    _eventDetails: SelectRootChangeEventDetails,
  ) => void = (v) => {
    const resolved = v === "__ALL__" ? undefined : (v ?? undefined);
    setLocalValue(resolved ?? "");
    onChange(resolved);
  };

  if (debounceMs) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label className="label-uppercase">{label}</Label>
        <Input
          type="search"
          placeholder={placeholder ?? label}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="label-uppercase">{label}</Label>
      <Select value={value ?? "__ALL__"} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__ALL__">{allOption}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {optionLabels?.[opt] ?? opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
