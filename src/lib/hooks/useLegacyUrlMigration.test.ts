import { describe, expect, it } from "vitest";

describe("legacy URL migration logic", () => {
  function migrateLegacyParams(
    pathname: string,
    params: URLSearchParams,
  ): string | null {
    const hasLegacyFrom = params.has("from");
    const hasLegacyTo = params.has("to");

    if (!pathname.includes("/admin/prescriptions")) return null;
    if (!hasLegacyFrom && !hasLegacyTo) return null;

    const next = new URLSearchParams(params.toString());

    if (hasLegacyFrom) {
      next.set("fromDate", params.get("from")!);
      next.delete("from");
    }
    if (hasLegacyTo) {
      next.set("toDate", params.get("to")!);
      next.delete("to");
    }

    return `${pathname}?${next.toString()}`;
  }

  it("returns null for non-admin paths", () => {
    const params = new URLSearchParams("from=2026-01-01&to=2026-12-31");
    const result = migrateLegacyParams("/doctor/prescriptions", params);
    expect(result).toBeNull();
  });

  it("returns null when no legacy params exist on admin path", () => {
    const params = new URLSearchParams("status=PENDING");
    const result = migrateLegacyParams("/admin/prescriptions", params);
    expect(result).toBeNull();
  });

  it("migrates ?from= to ?fromDate= on admin prescriptions", () => {
    const params = new URLSearchParams("from=2026-01-01");
    const result = migrateLegacyParams("/admin/prescriptions", params);
    expect(result).toContain("fromDate=2026-01-01");
    expect(result).not.toContain("from=");
  });

  it("migrates ?to= to ?toDate= on admin prescriptions", () => {
    const params = new URLSearchParams("to=2026-12-31");
    const result = migrateLegacyParams("/admin/prescriptions", params);
    expect(result).toContain("toDate=2026-12-31");
    expect(result).not.toContain("to=");
  });

  it("migrates both ?from= and ?to= simultaneously", () => {
    const params = new URLSearchParams("from=2026-01-01&to=2026-12-31");
    const result = migrateLegacyParams("/admin/prescriptions", params);
    expect(result).toContain("fromDate=2026-01-01");
    expect(result).toContain("toDate=2026-12-31");
    expect(result).not.toContain("from=");
    expect(result).not.toContain("to=");
  });

  it("preserves existing params while migrating", () => {
    const params = new URLSearchParams("from=2026-01-01&status=PENDING");
    const result = migrateLegacyParams("/admin/prescriptions", params);
    expect(result).toContain("fromDate=2026-01-01");
    expect(result).toContain("status=PENDING");
  });

  it("returns full URL with migrated params", () => {
    const params = new URLSearchParams("from=2026-01-01");
    const result = migrateLegacyParams("/admin/prescriptions", params);
    expect(result).toBe("/admin/prescriptions?fromDate=2026-01-01");
  });
});
