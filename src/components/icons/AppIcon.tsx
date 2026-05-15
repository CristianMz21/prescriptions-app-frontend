"use client";

import { ICON_REGISTRY, type AppIconName } from "@/config/icon-registry";
import type { AppIconBaseProps, IconSizeToken } from "@/types/icons";
import { cn } from "@/lib/utils";

const SIZE_CLASS: Record<IconSizeToken, string> = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-7",
};

type AppIconProps = Readonly<
  AppIconBaseProps & {
    name: AppIconName;
  }
>;

export function AppIcon({
  name,
  className,
  size = "md",
  decorative = true,
  title,
  "aria-label": ariaLabel,
  ...props
}: AppIconProps) {
  const Icon = ICON_REGISTRY[name];
  const tokenClass = typeof size === "number" ? undefined : SIZE_CLASS[size];
  const pxSize = typeof size === "number" ? size : undefined;
  const resolvedLabel = decorative ? undefined : (ariaLabel ?? title);

  return (
    <Icon
      className={cn("shrink-0", tokenClass, className)}
      size={pxSize}
      aria-hidden={decorative}
      aria-label={resolvedLabel}
      focusable={false}
      role={decorative ? "presentation" : "img"}
      {...props}
    />
  );
}
