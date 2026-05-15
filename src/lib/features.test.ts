import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isDoctorAnalyticsEnabled } from "./features";

const ENV_KEY = "NEXT_PUBLIC_DOCTOR_ANALYTICS_ENABLED";

describe("isDoctorAnalyticsEnabled", () => {
  const originalValue = process.env[ENV_KEY];

  beforeEach(() => {
    delete process.env[ENV_KEY];
  });

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = originalValue;
    }
  });

  it("is disabled when the env var is unset", () => {
    expect(isDoctorAnalyticsEnabled()).toBe(false);
  });

  it("is disabled when the env var is empty", () => {
    process.env[ENV_KEY] = "";
    expect(isDoctorAnalyticsEnabled()).toBe(false);
  });

  it("recognises every documented truthy value (case-insensitive)", () => {
    for (const value of ["1", "true", "TRUE", "yes", "YES", "on", "On"]) {
      process.env[ENV_KEY] = value;
      expect(isDoctorAnalyticsEnabled(), `value "${value}" should be truthy`).toBe(true);
    }
  });

  it("rejects values that are not in the explicit allowlist", () => {
    for (const value of ["0", "false", "no", "off", "enabled", "garbage"]) {
      process.env[ENV_KEY] = value;
      expect(
        isDoctorAnalyticsEnabled(),
        `value "${value}" should be falsy (allowlist semantics)`,
      ).toBe(false);
    }
  });
});
