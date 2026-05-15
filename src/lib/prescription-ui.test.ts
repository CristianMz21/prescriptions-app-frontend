import { describe, expect, it } from "vitest";
import type { PrescriptionResponseDto } from "@/lib/api/generated/schemas";
import { getPrescriptionExpiry, getUserDisplayName } from "./prescription-ui";

describe("getUserDisplayName", () => {
  it("returns the trimmed display name when present", () => {
    expect(getUserDisplayName({ name: "  Jane Doe  " })).toBe("Jane Doe");
  });

  it("title-cases the email local part when no name is set", () => {
    expect(getUserDisplayName({ email: "jane.doe@clinic.com" })).toBe(
      "Jane Doe",
    );
  });

  it("handles dash and underscore separators in the email local part", () => {
    expect(getUserDisplayName({ email: "jane-doe@clinic.com" })).toBe(
      "Jane Doe",
    );
    expect(getUserDisplayName({ email: "jane_doe@clinic.com" })).toBe(
      "Jane Doe",
    );
  });

  it("falls back to 'N/A' when no email AND no name is available", () => {
    expect(getUserDisplayName({})).toBe("N/A");
    expect(getUserDisplayName(undefined)).toBe("N/A");
  });

  it("prefers a present `name` over the email local part", () => {
    expect(
      getUserDisplayName({ name: "Custom Name", email: "x@y.com" }),
    ).toBe("Custom Name");
  });

  it("treats whitespace-only `name` as absent", () => {
    expect(getUserDisplayName({ name: "   ", email: "fallback@x.com" })).toBe(
      "Fallback",
    );
  });
});

describe("getPrescriptionExpiry", () => {
  const base = { id: "rx-1" } as PrescriptionResponseDto;

  it("returns the expiry date when set", () => {
    const rx = { ...base, expiryDate: "2026-12-31T00:00:00Z" };
    expect(getPrescriptionExpiry(rx as PrescriptionResponseDto)).toBe(
      "2026-12-31T00:00:00Z",
    );
  });

  it("returns null when expiryDate is undefined", () => {
    expect(getPrescriptionExpiry(base)).toBeNull();
  });

  it("returns null when expiryDate is explicitly null", () => {
    const rx = { ...base, expiryDate: null };
    expect(
      getPrescriptionExpiry(rx as unknown as PrescriptionResponseDto),
    ).toBeNull();
  });
});
