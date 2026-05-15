import { describe, expect, it } from "vitest";
import { cn, formatDate } from "./utils";

describe("cn", () => {
  it("joins multiple class strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, 0, "b")).toBe("a b");
  });

  it("dedupes conflicting Tailwind utilities (last one wins)", () => {
    // Driven by tailwind-merge: `p-4` and `p-2` are conflicting padding
    // shorthands; merge keeps the last.
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("accepts arrays + objects (clsx semantics)", () => {
    expect(cn(["a", "b"])).toBe("a b");
    expect(cn({ a: true, b: false, c: true })).toBe("a c");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  // Use noon-UTC dates everywhere so any host-local timezone (even UTC-12)
  // still lands on the same calendar day after `new Date(...)` parsing.
  it("formats an ISO date with the default options (en-US, short month)", () => {
    const out = formatDate("2026-01-15T12:00:00Z");
    expect(out).toMatch(/Jan/);
    expect(out).toMatch(/15/);
    expect(out).toMatch(/2026/);
  });

  it("accepts a Date instance", () => {
    const out = formatDate(new Date("2026-12-31T12:00:00Z"));
    expect(out).toMatch(/Dec/);
    expect(out).toMatch(/2026/);
  });

  it("respects custom Intl.DateTimeFormatOptions", () => {
    const out = formatDate("2026-03-04T12:00:00Z", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/03/);
    expect(out).toMatch(/04/);
  });
});
