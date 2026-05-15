"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUsersUpdateMyTheme } from "@/lib/api/generated/prescriptionManagementAPI";
import { ThemePreference } from "@/lib/api/generated/schemas";
import type { ErrorResponseDto } from "@/lib/api/generated/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { qk } from "@/lib/api/queryKeys";
import { notify } from "@/lib/notifications";
import type { AppIconName } from "@/config/icon-registry";
import { AppIcon } from "@/components/icons/AppIcon";

interface ThemeToggleProps {
  initial: ThemePreference;
}

const META: Record<ThemePreference, { label: string; icon: AppIconName }> = {
  SYSTEM: { label: "System", icon: "monitor" },
  LIGHT: { label: "Light", icon: "sun" },
  DARK: { label: "Dark", icon: "moon" },
};

function applyHtmlClass(pref: ThemePreference) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark =
    pref === "DARK" ||
    (pref === "SYSTEM" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
  root.dataset.theme = pref;
}

export function ThemeToggle({ initial }: ThemeToggleProps) {
  const [pref, setPref] = useState<ThemePreference>(initial);
  const queryClient = useQueryClient();

  useEffect(() => {
    applyHtmlClass(pref);
  }, [pref]);

  const { mutate, isPending } = useUsersUpdateMyTheme({
    mutation: {
      onSuccess: () => {
        notify.success("Theme updated");
        void queryClient.invalidateQueries({ queryKey: qk.auth.profile() });
      },
      onError: (err: ErrorResponseDto | Error) =>
        notify.apiError(err, "Could not save theme"),
    },
  });

  const choose = (next: ThemePreference) => {
    if (next === pref) return;
    setPref(next);
    mutate({ data: { themePreference: next } });
  };

  const current = META[pref];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" disabled={isPending}>
            <AppIcon name={current.icon} size="sm" />
            {current.label}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        {(Object.keys(META) as ThemePreference[]).map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => choose(opt)}
            className="flex items-center gap-2"
          >
            <AppIcon name={META[opt].icon} size="sm" />
            {META[opt].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
