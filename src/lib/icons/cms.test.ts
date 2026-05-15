import { describe, expect, it } from "vitest";
import { resolveCmsIcon } from "./cms";

describe("resolveCmsIcon", () => {
  it("returns the registered icon for a known CMS slug", () => {
    expect(resolveCmsIcon("analytics")).toBe("barChart3");
    expect(resolveCmsIcon("prescription")).toBe("pill");
    expect(resolveCmsIcon("patient")).toBe("userRound");
    expect(resolveCmsIcon("doctor")).toBe("hospital");
    expect(resolveCmsIcon("profile")).toBe("userCircle2");
    expect(resolveCmsIcon("download")).toBe("download");
    expect(resolveCmsIcon("empty")).toBe("inbox");
    expect(resolveCmsIcon("warning")).toBe("alertCircle");
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(resolveCmsIcon("  Analytics  ")).toBe("barChart3");
    expect(resolveCmsIcon("PRESCRIPTION")).toBe("pill");
    expect(resolveCmsIcon("  Doctor  ")).toBe("hospital");
  });

  it("falls back to 'inbox' for unknown slugs", () => {
    expect(resolveCmsIcon("not-a-real-icon")).toBe("inbox");
  });

  it("falls back to 'inbox' for null/undefined/empty", () => {
    expect(resolveCmsIcon(null)).toBe("inbox");
    expect(resolveCmsIcon(undefined)).toBe("inbox");
    expect(resolveCmsIcon("")).toBe("inbox");
  });
});
