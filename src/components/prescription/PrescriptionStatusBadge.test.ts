import { describe, expect, it } from "vitest";
import { STATUS_META } from "./prescriptionStatusMeta";

describe("PrescriptionStatusBadge STATUS_META", () => {
  it("maps PENDING to a hollow pending_actions icon", () => {
    expect(STATUS_META.PENDING).toMatchObject({
      icon: "pending_actions",
      label: "Pending",
      filled: false,
    });
    // monochrome — no green/red, only neutral surface variants
    expect(STATUS_META.PENDING.tone).not.toMatch(/green|red|emerald|rose/i);
  });

  it("maps CONSUMED to a filled check_circle icon in primary tone", () => {
    expect(STATUS_META.CONSUMED).toMatchObject({
      icon: "check_circle",
      label: "Consumed",
      filled: true,
    });
    expect(STATUS_META.CONSUMED.tone).toContain("text-primary");
  });

  it("exposes one entry per PrescriptionStatus value", () => {
    expect(Object.keys(STATUS_META).sort()).toEqual(["CONSUMED", "PENDING"]);
  });
});
