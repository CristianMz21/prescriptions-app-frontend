import type { LucideProps } from "lucide-react";

export type IconSizeToken = "xs" | "sm" | "md" | "lg" | "xl";
export type AppIconSize = IconSizeToken | number;

export interface AppIconBaseProps extends Omit<LucideProps, "size"> {
  size?: AppIconSize;
  decorative?: boolean;
  title?: string;
}
