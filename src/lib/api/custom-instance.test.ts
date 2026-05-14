import { describe, expect, it } from "vitest";
import { ApiError, API_BASE_URL, apiClient } from "./custom-instance";

describe("apiClient (underlying axios instance)", () => {
  it("uses the configured API_BASE_URL", () => {
    expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
  });

  it("enables credentialed requests for cookie-based auth", () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it("sends application/json by default", () => {
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });
});

describe("ApiError", () => {
  it("exposes the ApiError class for typed error narrowing", () => {
    const err = new ApiError(404, "Not Found", "/prescriptions/123");
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not Found");
    expect(err.path).toBe("/prescriptions/123");
    expect(err.name).toBe("ApiError");
  });
});
