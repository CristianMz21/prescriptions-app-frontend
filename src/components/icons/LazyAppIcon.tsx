"use client";

import { lazy, Suspense, type ComponentType } from "react";
import type { AppIconBaseProps } from "@/types/icons";
import { AppIcon } from "./AppIcon";
import type { AppIconName } from "@/config/icon-registry";

const OPTIONAL_ICON_LOADERS = {
  activity: () => import("lucide-react").then((m) => ({ default: m.Activity })),
  shieldAlert: () =>
    import("lucide-react").then((m) => ({ default: m.ShieldAlert })),
} as const;

type LazyIconName = keyof typeof OPTIONAL_ICON_LOADERS;

interface LazyAppIconProps extends AppIconBaseProps {
  name: LazyIconName | AppIconName;
  fallbackName?: AppIconName;
}

export function LazyAppIcon({
  name,
  fallbackName = "loader2",
  ...props
}: LazyAppIconProps) {
  if (!(name in OPTIONAL_ICON_LOADERS)) {
    return <AppIcon name={name as AppIconName} {...props} />;
  }

  const Loader = lazy(
    OPTIONAL_ICON_LOADERS[name as LazyIconName] as () => Promise<{
      default: ComponentType<AppIconBaseProps>;
    }>,
  );
  return (
    <Suspense fallback={<AppIcon name={fallbackName} className="animate-spin" {...props} />}>
      <Loader {...props} />
    </Suspense>
  );
}
