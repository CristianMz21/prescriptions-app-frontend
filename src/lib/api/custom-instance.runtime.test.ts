/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("custom-instance runtime baseURL", () => {
  it("uses same-origin proxy in browser runtime", async () => {
    vi.stubGlobal("window", {});
    const mod = await import("./custom-instance");
    expect(mod.apiClient.defaults.baseURL).toBe("/api/backend");
  });

  it("uses NEXT_PUBLIC_API_URL in server runtime", async () => {
    const mod = await import("./custom-instance");
    expect(mod.apiClient.defaults.baseURL).toBe(mod.API_BASE_URL);
  });
});
