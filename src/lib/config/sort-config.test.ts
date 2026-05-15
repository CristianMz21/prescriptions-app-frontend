import { describe, expect, it } from "vitest";
import {
  prescriptionSortOptions,
  userSortOptions,
  sortOrderOptions,
} from "./sort-config";

describe("sort-config", () => {
  it("prescriptionSortOptions has the documented fields in stable order", () => {
    expect(prescriptionSortOptions).toEqual([
      "createdAt",
      "code",
      "status",
      "consumedAt",
    ]);
  });

  it("userSortOptions has the documented fields in stable order", () => {
    expect(userSortOptions).toEqual(["createdAt", "email", "role"]);
  });

  it("sortOrderOptions is the ascending/descending pair", () => {
    expect(sortOrderOptions).toEqual(["asc", "desc"]);
  });

  it("prescriptionSortOptions contains no duplicates", () => {
    const set = new Set(prescriptionSortOptions);
    expect(set.size).toBe(prescriptionSortOptions.length);
  });

  it("userSortOptions contains no duplicates", () => {
    const set = new Set(userSortOptions);
    expect(set.size).toBe(userSortOptions.length);
  });

  it("options arrays are non-empty (UI assumes ≥1 sort option)", () => {
    expect(prescriptionSortOptions.length).toBeGreaterThan(0);
    expect(userSortOptions.length).toBeGreaterThan(0);
  });
});
