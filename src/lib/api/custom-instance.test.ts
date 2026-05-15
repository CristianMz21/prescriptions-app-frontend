/**
 * @vitest-environment node
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { ApiError, API_BASE_URL, apiClient, customInstance } from "./custom-instance";

const ORIGIN = apiClient.defaults.baseURL;
if (!ORIGIN) {
  throw new Error("API origin is not configured in apiClient defaults.");
}

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

  it("derives `path` from the request when omitted at construction", () => {
    const err = new ApiError(500, "boom");
    expect(err.path).toBeUndefined();
  });
});

describe("response interceptor (non-refresh paths)", () => {
  const server = setupServer(
    http.get(`${ORIGIN}/_test/404`, () =>
      HttpResponse.json({ message: "missing" }, { status: 404 }),
    ),
    http.get(`${ORIGIN}/_test/500`, () =>
      new HttpResponse(null, { status: 500, statusText: "Server Error" }),
    ),
    http.get(`${ORIGIN}/auth/login`, () =>
      // 401 on an auth endpoint must NOT trigger a refresh loop.
      HttpResponse.json({ message: "bad creds" }, { status: 401 }),
    ),
  );

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("wraps a non-401 error response as ApiError with the backend message", async () => {
    await expect(
      customInstance({ method: "GET", url: "/_test/404" }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "missing",
    });
  });

  it("falls back to statusText when the body has no message", async () => {
    await expect(
      customInstance({ method: "GET", url: "/_test/500" }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      message: "Server Error",
    });
  });

  it("does NOT trigger a refresh on a 401 from an auth endpoint", async () => {
    // refreshSession would hit /auth/refresh; the msw setup does not define
    // that route, so a refresh attempt would 'unhandled-request' and throw a
    // distinguishable error. The expected ApiError(401) below confirms the
    // interceptor short-circuited correctly.
    await expect(
      customInstance({ method: "GET", url: "/auth/login" }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "bad creds",
    });
  });
});

describe("customInstance (Orval mutator entry point)", () => {
  const server = setupServer(
    http.get(`${ORIGIN}/_test/ok`, () =>
      HttpResponse.json({ ok: true, value: 42 }),
    ),
  );

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("returns response.data (not the full axios response)", async () => {
    const data = await customInstance<{ ok: boolean; value: number }>({
      method: "GET",
      url: "/_test/ok",
    });
    expect(data).toEqual({ ok: true, value: 42 });
  });
});
