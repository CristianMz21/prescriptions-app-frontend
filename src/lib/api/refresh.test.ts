/**
 * @vitest-environment node
 *
 * Verifies the refresh-token interceptor: a 401 from a non-/auth endpoint
 * triggers exactly one /auth/refresh call and replays the original request
 * once with the refreshed session.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { apiClient, ApiError } from "./custom-instance";

const ORIGIN = apiClient.defaults.baseURL;

if (!ORIGIN) {
  throw new Error("API origin is not configured in apiClient defaults.");
}

let refreshCallCount = 0;
let prescriptionsCallCount = 0;

const server = setupServer(
  http.get(`${ORIGIN}/prescriptions`, () => {
    prescriptionsCallCount += 1;
    if (refreshCallCount === 0) {
      return HttpResponse.json({ message: "expired" }, { status: 401 });
    }
    return HttpResponse.json({
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  }),
  http.post(`${ORIGIN}/auth/refresh`, () => {
    refreshCallCount += 1;
    return HttpResponse.json({ message: "rotated" }, { status: 201 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  refreshCallCount = 0;
  prescriptionsCallCount = 0;
});
afterAll(() => server.close());

describe("refresh interceptor", () => {
  it("on 401, calls /auth/refresh once and replays the original request", async () => {
    const res = await apiClient.get("/prescriptions");
    expect(res.status).toBe(200);
    expect(refreshCallCount).toBe(1);
    expect(prescriptionsCallCount).toBe(2);
  });

  it("does not retry on 401 from /auth/profile (avoids loops)", async () => {
    server.use(
      http.get(`${ORIGIN}/auth/profile`, () =>
        HttpResponse.json({ message: "no session" }, { status: 401 }),
      ),
    );
    await expect(apiClient.get("/auth/profile")).rejects.toThrow(ApiError);
    expect(refreshCallCount).toBe(0);
  });

  it("coalesces concurrent 401s into a single refresh call", async () => {
    const [a, b, c] = await Promise.all([
      apiClient.get("/prescriptions"),
      apiClient.get("/prescriptions"),
      apiClient.get("/prescriptions"),
    ]);
    expect([a.status, b.status, c.status]).toEqual([200, 200, 200]);
    expect(refreshCallCount).toBe(1);
  });
});
