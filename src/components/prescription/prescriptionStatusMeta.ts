import type { PrescriptionStatus } from "@/lib/api/generated/schemas";
import type { AppIconName } from "@/config/icon-registry";

export interface PrescriptionStatusMeta {
  icon: AppIconName;
  label: string;
  tone: string;
}

export const STATUS_META: Record<PrescriptionStatus, PrescriptionStatusMeta> = {
  PENDING: {
    icon: "clipboardList",
    label: "Pending",
    tone: "text-on-surface-variant border-outline-variant",
  },
  CONSUMED: {
    icon: "checkCircle2",
    label: "Consumed",
    tone: "text-primary border-outline-variant/50",
  },
};
