import { describe, expect, it } from "vitest";
import {
  prescriptionFilterSchema,
  adminPrescriptionFilterSchema,
  userFilterSchema,
  patientFilterSchema,
  doctorFilterSchema,
} from "./filter-schemas";

describe("prescriptionFilterSchema", () => {
  it("accepts valid prescription filters", () => {
    const valid = {
      status: "PENDING",
      fromDate: "2026-01-01",
      toDate: "2026-12-31",
      consumedFromDate: "2026-03-01",
      consumedToDate: "2026-03-31",
      code: "RX-AB",
      q: "amoxicillin",
      patientId: "123e4567-e89b-12d3-a456-426614174000",
      authorId: "123e4567-e89b-12d3-a456-426614174001",
      hasNotes: true,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    const result = prescriptionFilterSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = prescriptionFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    const result = prescriptionFilterSchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = prescriptionFilterSchema.safeParse({
      fromDate: "01-01-2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for patientId", () => {
    const result = prescriptionFilterSchema.safeParse({
      patientId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortBy value", () => {
    const result = prescriptionFilterSchema.safeParse({
      sortBy: "invalidField",
    });
    expect(result.success).toBe(false);
  });

  it("rejects code exceeding max length", () => {
    const result = prescriptionFilterSchema.safeParse({ code: "a".repeat(65) });
    expect(result.success).toBe(false);
  });

  it("accepts valid hasNotes boolean", () => {
    expect(prescriptionFilterSchema.safeParse({ hasNotes: true }).success).toBe(
      true,
    );
    expect(
      prescriptionFilterSchema.safeParse({ hasNotes: false }).success,
    ).toBe(true);
  });
});

describe("adminPrescriptionFilterSchema", () => {
  it("extends prescription filters with email fields", () => {
    const valid = {
      status: "PENDING",
      fromDate: "2026-01-01",
      toDate: "2026-12-31",
      consumedFromDate: "2026-03-01",
      consumedToDate: "2026-03-31",
      code: "RX-AB",
      hasNotes: true,
      q: "amoxicillin",
      sortBy: "createdAt",
      sortOrder: "desc",
      patientEmail: "patient@clinic.com",
      doctorEmail: "doctor@clinic.com",
    };
    const result = adminPrescriptionFilterSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects patientEmail exceeding max length", () => {
    const result = adminPrescriptionFilterSchema.safeParse({
      patientEmail: "a".repeat(256),
    });
    expect(result.success).toBe(false);
  });
});

describe("userFilterSchema", () => {
  it("accepts valid user filters", () => {
    const valid = {
      role: "DOCTOR",
      createdFromDate: "2026-01-01",
      createdToDate: "2026-12-31",
      themePreference: "DARK",
      sortBy: "email",
      sortOrder: "asc",
      q: "search term",
    };
    const result = userFilterSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = userFilterSchema.safeParse({ role: "SUPERADMIN" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid theme preference", () => {
    const result = userFilterSchema.safeParse({ themePreference: "MIDNIGHT" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortBy for user", () => {
    const result = userFilterSchema.safeParse({ sortBy: "createdAt" });
    expect(result.success).toBe(true); // createdAt is valid
    const invalid = userFilterSchema.safeParse({ sortBy: "status" });
    expect(invalid.success).toBe(false); // status is not a user sort field
  });
});

describe("patientFilterSchema", () => {
  it("extends user filters with patient-specific fields", () => {
    const valid = {
      role: "PATIENT",
      createdFromDate: "2026-01-01",
      birthDateFromDate: "1960-01-01",
      birthDateToDate: "2010-12-31",
      minAge: 18,
      maxAge: 65,
    };
    const result = patientFilterSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects minAge out of range", () => {
    const result = patientFilterSchema.safeParse({ minAge: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects maxAge exceeding 150", () => {
    const result = patientFilterSchema.safeParse({ maxAge: 151 });
    expect(result.success).toBe(false);
  });
});

describe("doctorFilterSchema", () => {
  it("extends user filters with doctor-specific fields", () => {
    const valid = {
      role: "DOCTOR",
      specialty: "cardiology",
      medicalId: "MED-12345",
    };
    const result = doctorFilterSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects specialty exceeding max length", () => {
    const result = doctorFilterSchema.safeParse({ specialty: "a".repeat(129) });
    expect(result.success).toBe(false);
  });

  it("rejects medicalId exceeding max length", () => {
    const result = doctorFilterSchema.safeParse({ medicalId: "a".repeat(65) });
    expect(result.success).toBe(false);
  });
});
