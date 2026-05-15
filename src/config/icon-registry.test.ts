import { describe, expect, it } from "vitest";
import { ICON_REGISTRY, type AppIconName } from "./icon-registry";

describe("ICON_REGISTRY", () => {
  it("exposes every documented app icon name", () => {
    const expected: AppIconName[] = [
      "activity",
      "alertCircle",
      "arrowLeft",
      "barChart3",
      "check",
      "checkCircle2",
      "chevronLeft",
      "chevronRight",
      "circlePlus",
      "clipboardList",
      "download",
      "eye",
      "fileText",
      "home",
      "hospital",
      "inbox",
      "loader2",
      "logOut",
      "menu",
      "moon",
      "monitor",
      "notebookPen",
      "pill",
      "search",
      "shieldAlert",
      "sun",
      "trendingUp",
      "userCircle2",
      "userRound",
      "users",
      "x",
    ];
    expect(Object.keys(ICON_REGISTRY).sort()).toEqual(
      [...expected].sort(),
    );
  });

  it("registers each entry as a Lucide-style icon component (function/forwardRef)", () => {
    for (const [name, icon] of Object.entries(ICON_REGISTRY)) {
      // Lucide icons are forwardRef objects (typeof 'object') or function components.
      const kind = typeof icon;
      expect(
        kind === "function" || kind === "object",
        `icon "${name}" must be a function or forwardRef object, got ${kind}`,
      ).toBe(true);
    }
  });

  it("does not include duplicate Lucide components under different keys", () => {
    const seen = new Map<unknown, string>();
    for (const [name, icon] of Object.entries(ICON_REGISTRY)) {
      const prior = seen.get(icon);
      expect(
        prior,
        `icon "${name}" duplicates "${prior}" — same Lucide component registered twice`,
      ).toBeUndefined();
      seen.set(icon, name);
    }
  });
});
