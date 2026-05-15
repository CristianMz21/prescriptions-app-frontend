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

const LAZY_ICONS: Record<LazyIconName, ComponentType<AppIconBaseProps>> = {
  activity: lazy(
    OPTIONAL_ICON_LOADERS.activity as () => Promise<{
      default: ComponentType<AppIconBaseProps>;
    }>,
  ),
  shieldAlert: lazy(
    OPTIONAL_ICON_LOADERS.shieldAlert as () => Promise<{
      default: ComponentType<AppIconBaseProps>;
    }>,
  ),
};

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
  const Loader = LAZY_ICONS[name as LazyIconName];
  return (
    <Suspense fallback={<AppIcon name={fallbackName} className="animate-spin" {...props} />}>
      <Loader {...props} />
    </Suspense>
  );
}
