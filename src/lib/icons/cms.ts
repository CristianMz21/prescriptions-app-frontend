import type { AppIconName } from "@/config/icon-registry";

const CMS_ICON_ALLOWLIST: Record<string, AppIconName> = {
  analytics: "barChart3",
  prescription: "pill",
  patient: "userRound",
  doctor: "hospital",
  profile: "userCircle2",
  download: "download",
  empty: "inbox",
  warning: "alertCircle",
};

export function resolveCmsIcon(raw: string | null | undefined): AppIconName {
  if (!raw) return "inbox";
  const key = raw.trim().toLowerCase();
  return CMS_ICON_ALLOWLIST[key] ?? "inbox";
}
