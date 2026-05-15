import type { PrescriptionSortBy } from "@/lib/api/generated/schemas";
import type { UserSortBy } from "@/lib/api/generated/schemas";

const ASC_DESC = ["asc", "desc"] as const;

export const prescriptionSortOptions = [
  "createdAt",
  "code",
  "status",
  "consumedAt",
] as const satisfies ReadonlyArray<PrescriptionSortBy>;

export const userSortOptions = [
  "createdAt",
  "email",
  "role",
] as const satisfies ReadonlyArray<UserSortBy>;

export const sortOrderOptions = ASC_DESC;

export type SortOrder = (typeof ASC_DESC)[number];
export type PrescriptionSortField = (typeof prescriptionSortOptions)[number];
export type UserSortField = (typeof userSortOptions)[number];
