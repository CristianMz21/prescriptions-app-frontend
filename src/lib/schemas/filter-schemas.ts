import { z } from "zod";

// ── Prescription filters ──────────────────────────────────────────

export const prescriptionFilterSchema = z.object({
  status: z.enum(["PENDING", "CONSUMED"] as const).optional(),
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  consumedFromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  consumedToDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  code: z.string().max(64).optional(),
  q: z.string().max(200).optional(),
  patientId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  hasNotes: z.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "consumedAt", "code", "status"] as const)
    .optional(),
  sortOrder: z.enum(["asc", "desc"] as const).optional(),
});

export type PrescriptionFilterValues = z.infer<typeof prescriptionFilterSchema>;

// ── Admin prescription filters ────────────────────────────────────

export const adminPrescriptionFilterSchema = prescriptionFilterSchema.extend({
  patientEmail: z.string().max(255).optional(),
  doctorEmail: z.string().max(255).optional(),
});

export type AdminPrescriptionFilterValues = z.infer<
  typeof adminPrescriptionFilterSchema
>;

// ── User filters ──────────────────────────────────────────────────

export const userFilterSchema = z.object({
  role: z.enum(["ADMIN", "DOCTOR", "PATIENT"] as const).optional(),
  createdFromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  createdToDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  themePreference: z.enum(["SYSTEM", "LIGHT", "DARK"] as const).optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "email", "role"] as const)
    .optional(),
  sortOrder: z.enum(["asc", "desc"] as const).optional(),
  q: z.string().optional(),
});

export type UserFilterValues = z.infer<typeof userFilterSchema>;

// ── Patient list filters ──────────────────────────────────────────

export const patientFilterSchema = userFilterSchema.extend({
  birthDateFromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  birthDateToDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  minAge: z.number().int().min(0).max(150).optional(),
  maxAge: z.number().int().min(0).max(150).optional(),
});

export type PatientFilterValues = z.infer<typeof patientFilterSchema>;

// ── Doctor list filters ───────────────────────────────────────────

export const doctorFilterSchema = userFilterSchema.extend({
  specialty: z.string().max(128).optional(),
  medicalId: z.string().max(64).optional(),
});

export type DoctorFilterValues = z.infer<typeof doctorFilterSchema>;
