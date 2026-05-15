import type { PrescriptionResponseDto } from "@/lib/api/generated/schemas";

function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getUserDisplayName(user?: { email?: string; name?: string }) {
  if (user?.name?.trim()) return user.name.trim();
  if (!user?.email) return "N/A";
  return titleCase(user.email.split("@")[0] ?? user.email);
}

export function getPrescriptionExpiry(
  prescription: PrescriptionResponseDto,
): string | null {
  const maybeExpiry = (
    prescription as PrescriptionResponseDto & { expiryDate?: string | null }
  ).expiryDate;
  return maybeExpiry ?? null;
}
