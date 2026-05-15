import { describe, expect, it } from "vitest";
import { STATUS_META } from "./prescriptionStatusMeta";

describe("PrescriptionStatusBadge STATUS_META", () => {
  it("maps PENDING to a neutral pending icon", () => {
    expect(STATUS_META.PENDING).toMatchObject({
      icon: "clipboardList",
      label: "Pending",
    });
    // monochrome — no green/red, only neutral surface variants
    expect(STATUS_META.PENDING.tone).not.toMatch(/green|red|emerald|rose/i);
  });

  it("maps CONSUMED to a check icon in primary tone", () => {
    expect(STATUS_META.CONSUMED).toMatchObject({
      icon: "checkCircle2",
      label: "Consumed",
    });
    expect(STATUS_META.CONSUMED.tone).toContain("text-primary");
  });

  it("exposes one entry per PrescriptionStatus value", () => {
    expect(Object.keys(STATUS_META).sort()).toEqual(["CONSUMED", "PENDING"]);
  });
});
